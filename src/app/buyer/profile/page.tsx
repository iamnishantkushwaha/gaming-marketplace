"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useApp, useCurrentUser } from "@/lib/store";
import { Tabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/Badge";
import { SideSheet } from "@/components/ui/SideSheet";
import { Field } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/Empty";
import { money, shortDate } from "@/lib/format";

export default function BuyerProfilePage() {
  const { state, dispatch, toast } = useApp();
  const user = useCurrentUser();
  const router = useRouter();
  const [tab, setTab] = useState<"Overview" | "Purchase history" | "Reviews I've left">("Overview");
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState({ name: user?.name ?? "", bio: user?.bio ?? "", country: user?.country ?? "" });

  if (!user) return null;

  const myOrders = state.orders.filter((o) => o.buyerId === user.id);
  const myReviews = state.reviews.filter((r) => r.authorId === user.id);

  function save() {
    dispatch({ type: "UPDATE_USER", userId: user!.id, patch: draft });
    setEditOpen(false);
    toast("Changes saved");
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="gt-card p-6 flex items-center gap-4 flex-wrap">
        <Image src={user.avatarUrl} alt={user.name} width={64} height={64} className="rounded-full" />
        <div className="flex-1 min-w-[160px]">
          <h1 className="text-lg font-semibold text-base-100">{user.name}</h1>
          <p className="text-xs text-base-400">Joined {shortDate(user.joinDate)}</p>
        </div>
        <button onClick={() => setEditOpen(true)} className="gt-btn-secondary">
          Edit profile
        </button>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { label: "Overview", value: "Overview" },
          { label: "Purchase history", value: "Purchase history" },
          { label: "Reviews I've left", value: "Reviews I've left" },
        ]}
      />

      {tab === "Overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Stat label="Total orders" value={String(myOrders.length)} />
            <Stat label="Total spent" value={money(myOrders.reduce((s, o) => s + o.amount, 0))} />
            <Stat label="Member since" value={shortDate(user.joinDate)} />
          </div>
          <Link href="/buyer/profile/verification" className="gt-card p-4 flex items-center justify-between hover:border-brand-500/50">
            <span className="text-sm font-medium text-base-100">Verification status</span>
            <StatusBadge status={user.verificationStatus} kind="verification" />
          </Link>
        </div>
      )}

      {tab === "Purchase history" && (
        <div className="gt-card divide-y divide-base-700">
          {myOrders.length === 0 && <EmptyState title="No purchases yet" />}
          {myOrders.map((o) => {
            const listing = state.listings.find((l) => l.id === o.listingId);
            return (
              <button
                key={o.id}
                onClick={() => router.push(`/buyer/orders/${o.id}`)}
                className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left text-sm hover:bg-base-800/60"
              >
                <div>
                  <p className="text-base-100 font-medium">{listing?.title}</p>
                  <p className="text-xs text-base-400">{shortDate(o.placedDate)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base-200">{money(o.amount)}</span>
                  <StatusBadge status={o.status} kind="order" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {tab === "Reviews I've left" && (
        <div className="gt-card divide-y divide-base-700">
          {myReviews.length === 0 && <EmptyState title="You haven't reviewed anyone yet" />}
          {myReviews.map((r) => {
            const subject = state.users.find((u) => u.id === r.subjectId);
            return (
              <div key={r.id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-base-100">{subject?.name}</span>
                  <span className="text-xs text-base-400">{shortDate(r.date)}</span>
                </div>
                <p className="mt-1 text-base-300">{r.comment}</p>
              </div>
            );
          })}
        </div>
      )}

      <SideSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit profile"
        footer={
          <>
            <button className="gt-btn-secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </button>
            <button className="gt-btn-primary" onClick={save}>
              Save changes
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Display name">
            <input className="gt-input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </Field>
          <Field label="Avatar">
            <button className="gt-btn-secondary w-full">Upload new photo</button>
          </Field>
          <Field label="Bio">
            <textarea className="gt-input" rows={3} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
          </Field>
          <Field label="Country">
            <input className="gt-input" value={draft.country} onChange={(e) => setDraft({ ...draft, country: e.target.value })} />
          </Field>
        </div>
      </SideSheet>
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
