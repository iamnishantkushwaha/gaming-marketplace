"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { MoreVertical } from "lucide-react";
import { useApp } from "@/lib/store";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Empty";
import { ConfirmDialog } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { Table, THead, TBody, Tr, Th, Td, MobileRow, MobileRowLine } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";
import { shortDate } from "@/lib/format";

type TabKey = "All" | "Buyers" | "Sellers" | "Banned";

function AdminUsersInner() {
  const { state, dispatch, toast } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const [tab, setTab] = useState<TabKey>(params.get("status") === "Active" ? "All" : "All");
  const [search, setSearch] = useState("");
  const [verFilter, setVerFilter] = useState("Any");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [banTarget, setBanTarget] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");

  const filtered = useMemo(() => {
    let result = state.users.filter((u) => !u.roles.includes("Admin") && !u.roles.includes("Support"));
    if (tab === "Buyers") result = result.filter((u) => u.roles.includes("Buyer"));
    if (tab === "Sellers") result = result.filter((u) => u.roles.includes("Seller"));
    if (tab === "Banned") result = result.filter((u) => u.accountStatus === "Banned");
    if (verFilter !== "Any") result = result.filter((u) => u.verificationStatus === verFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return result;
  }, [state.users, tab, verFilter, search]);

  function confirmBan() {
    if (!banTarget) return;
    dispatch({ type: "SET_ACCOUNT_STATUS", userId: banTarget, status: "Banned" });
    toast("User banned");
    setBanTarget(null);
    setBanReason("");
  }

  function unban(id: string) {
    dispatch({ type: "SET_ACCOUNT_STATUS", userId: id, status: "Active" });
    toast("User unbanned");
    setMenuFor(null);
  }

  return (
    <div className="space-y-5">
      <h1 className="gt-page-title">Users</h1>
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { label: "All", value: "All" },
          { label: "Buyers", value: "Buyers" },
          { label: "Sellers", value: "Sellers" },
          { label: "Banned", value: "Banned" },
        ]}
      />
      <div className="flex flex-col sm:flex-row gap-3">
        <input placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} className="gt-input sm:max-w-xs" />
        <Select
          className="sm:w-48"
          value={verFilter}
          onChange={(v) => setVerFilter(v)}
          options={[
            { value: "Any", label: "Any" },
            { value: "Unverified", label: "Unverified" },
            { value: "Pending", label: "Pending" },
            { value: "Verified", label: "Verified" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No users match your filters." />
      ) : (
        <Table>
          <THead>
            <Th>User</Th>
            <Th>Role</Th>
            <Th>Verification</Th>
            <Th>Joined</Th>
            <Th></Th>
          </THead>
          <TBody>
            {filtered.map((u) => (
              <Tr key={u.id} onClick={() => router.push(`/admin/users/${u.id}`)}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <Image src={u.avatarUrl} alt="" width={32} height={32} className="rounded-full" />
                    <div>
                      <p className="font-medium text-base-100">{u.name}</p>
                      <p className="text-xs text-base-400">{u.email}</p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <div className="flex gap-1 flex-wrap">
                    {u.roles.map((r) => (
                      <Badge key={r} tone="neutral">
                        {r}
                      </Badge>
                    ))}
                    {u.accountStatus === "Banned" && <Badge tone="danger">Banned</Badge>}
                  </div>
                </Td>
                <Td>
                  <StatusBadge status={u.verificationStatus} kind="verification" />
                </Td>
                <Td className="text-base-400">{shortDate(u.joinDate)}</Td>
                <Td onClick={(e: any) => e.stopPropagation()} className="relative">
                  <button onClick={() => setMenuFor(menuFor === u.id ? null : u.id)} className="text-base-400 hover:text-base-100">
                    <MoreVertical size={16} />
                  </button>
                  {menuFor === u.id && (
                    <div className="absolute right-4 top-10 z-20 w-40 gt-card py-1 shadow-2xl">
                      <button onClick={() => router.push(`/admin/users/${u.id}`)} className="block w-full px-3 py-2 text-left text-sm hover:bg-base-800">
                        View profile
                      </button>
                      {u.accountStatus === "Banned" ? (
                        <button onClick={() => unban(u.id)} className="block w-full px-3 py-2 text-left text-sm hover:bg-base-800">
                          Unban user
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setBanTarget(u.id);
                            setMenuFor(null);
                          }}
                          className="block w-full px-3 py-2 text-left text-sm text-accent-rose hover:bg-base-800"
                        >
                          Ban user
                        </button>
                      )}
                    </div>
                  )}
                </Td>
              </Tr>
            ))}
          </TBody>
          {filtered.map((u) => (
            <MobileRow key={u.id} onClick={() => router.push(`/admin/users/${u.id}`)}>
              <div className="flex items-center gap-3">
                <Image src={u.avatarUrl} alt="" width={40} height={40} className="rounded-full" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-base-100 text-sm">{u.name}</p>
                  <p className="text-xs text-base-400 truncate">{u.email}</p>
                </div>
                <StatusBadge status={u.verificationStatus} kind="verification" />
              </div>
              <MobileRowLine label="Roles" value={u.roles.join(", ")} />
              <MobileRowLine label="Joined" value={shortDate(u.joinDate)} />
            </MobileRow>
          ))}
        </Table>
      )}

      <ConfirmDialog
        open={!!banTarget}
        onClose={() => setBanTarget(null)}
        onConfirm={confirmBan}
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

export default function AdminUsersPage() {
  return (
    <Suspense fallback={null}>
      <AdminUsersInner />
    </Suspense>
  );
}
