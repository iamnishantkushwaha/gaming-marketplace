"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useApp, useUserById } from "@/lib/store";
import { Tabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/Empty";
import { money, shortDate } from "@/lib/format";

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const user = useUserById(params.id);
  const { state, dispatch, toast } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState<"Overview" | "Listings" | "Orders" | "Verification documents">("Overview");
  const [banOpen, setBanOpen] = useState(false);
  const [banReason, setBanReason] = useState("");

  if (!user) return <EmptyState title="User not found" />;

  const isSeller = user.roles.includes("Seller");
  const listings = state.listings.filter((l) => l.sellerId === user.id);
  const orders = state.orders.filter((o) => o.buyerId === user.id || o.sellerId === user.id);

  function banConfirm() {
    dispatch({ type: "SET_ACCOUNT_STATUS", userId: user!.id, status: "Banned" });
    toast("User banned");
    setBanOpen(false);
  }

  function unban() {
    dispatch({ type: "SET_ACCOUNT_STATUS", userId: user!.id, status: "Active" });
    toast("User unbanned");
  }

  function approveVerification(status: "Verified" | "Rejected") {
    dispatch({ type: "SET_VERIFICATION", userId: user!.id, status });
    toast(`Verification ${status.toLowerCase()}`);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="gt-card p-6 flex items-center gap-4 flex-wrap">
        <Image src={user.avatarUrl} alt={user.name} width={64} height={64} className="rounded-full" />
        <div className="flex-1 min-w-[160px]">
          <h1 className="text-lg font-semibold text-base-100">{user.name}</h1>
          <div className="mt-1 flex gap-1.5 flex-wrap">
            {user.roles.map((r) => (
              <span key={r} className="text-xs text-base-400">
                {r}
              </span>
            ))}
            <StatusBadge status={user.accountStatus} kind="account" />
          </div>
        </div>
        {user.accountStatus === "Banned" ? (
          <button onClick={unban} className="gt-btn-primary">
            Unban user
          </button>
        ) : (
          <button onClick={() => setBanOpen(true)} className="gt-btn-destructive">
            Ban user
          </button>
        )}
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { label: "Overview", value: "Overview" },
          ...(isSeller ? [{ label: "Listings", value: "Listings" as const }] : []),
          { label: "Orders", value: "Orders" },
          { label: "Verification documents", value: "Verification documents" },
        ]}
      />

      {tab === "Overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Orders as buyer" value={String(user.totalOrdersAsBuyer ?? 0)} />
            <Stat label="Sales as seller" value={String(user.totalSalesAsSeller ?? 0)} />
            <Stat label="Total spent" value={money(user.totalSpent ?? 0)} />
            <Stat label="Total earned" value={money(user.totalEarned ?? 0)} />
          </div>
          <div className="gt-card p-4 text-sm space-y-1.5">
            <p className="text-base-400">Account created: <span className="text-base-200">{shortDate(user.joinDate)}</span></p>
            <p className="text-base-400">Last login: <span className="text-base-200">2 hours ago</span></p>
            <p className="text-base-400">Last order: <span className="text-base-200">{orders[0] ? shortDate(orders[0].placedDate) : "—"}</span></p>
          </div>
        </div>
      )}

      {tab === "Listings" && (
        <div className="gt-card divide-y divide-base-700">
          {listings.length === 0 && <EmptyState title="No listings" />}
          {listings.map((l) => (
            <button key={l.id} onClick={() => router.push(`/admin/listings/${l.id}`)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-base-800/60">
              <span className="text-base-100">{l.title}</span>
              <StatusBadge status={l.status} kind="listing" />
            </button>
          ))}
        </div>
      )}

      {tab === "Orders" && (
        <div className="gt-card divide-y divide-base-700">
          {orders.length === 0 && <EmptyState title="No orders" />}
          {orders.map((o) => (
            <button key={o.id} onClick={() => router.push(`/admin/orders/${o.id}`)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-base-800/60">
              <span className="text-base-100">{o.id}</span>
              <div className="flex items-center gap-2">
                <span className="text-base-300">{money(o.amount)}</span>
                <StatusBadge status={o.status} kind="order" />
              </div>
            </button>
          ))}
        </div>
      )}

      {tab === "Verification documents" && (
        <div className="gt-card p-5 space-y-4">
          <StatusBadge status={user.verificationStatus} kind="verification" />
          <div className="flex flex-wrap gap-3 text-sm text-base-300">
            <span className="rounded-lg border border-base-600 px-3 py-2">id_front.jpg</span>
            <span className="rounded-lg border border-base-600 px-3 py-2">id_back.jpg</span>
            <span className="rounded-lg border border-base-600 px-3 py-2">selfie.jpg</span>
          </div>
          {user.verificationStatus === "Pending" && (
            <div className="flex gap-3">
              <button onClick={() => approveVerification("Verified")} className="gt-btn-primary">
                Approve
              </button>
              <button onClick={() => approveVerification("Rejected")} className="gt-btn-destructive">
                Reject
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={banOpen}
        onClose={() => setBanOpen(false)}
        onConfirm={banConfirm}
        title="Ban this user?"
        message="Their account will be marked as banned across the platform."
        confirmLabel="Ban user"
        requireReason
        reason={banReason}
        onReasonChange={setBanReason}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="gt-card p-4">
      <p className="text-xs text-base-400">{label}</p>
      <p className="mt-1 gt-stat-value">{value}</p>
    </div>
  );
}
