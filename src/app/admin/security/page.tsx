"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp, useUserById } from "@/lib/store";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Empty";
import { SideSheet } from "@/components/ui/SideSheet";
import { ConfirmDialog } from "@/components/ui/Modal";
import { Table, THead, TBody, Tr, Th, Td, MobileRow, MobileRowLine } from "@/components/ui/Table";
import { shortDate } from "@/lib/format";
import { Flag } from "@/lib/types";

export default function AdminSecurityPage() {
  const { state, dispatch, toast } = useApp();
  const router = useRouter();
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");
  const [reviewing, setReviewing] = useState<Flag | null>(null);
  const [banConfirm, setBanConfirm] = useState(false);
  const [banReason, setBanReason] = useState("");

  const filtered = state.flags.filter((f) => (severity === "All" || f.severity === severity) && (status === "All" || f.status === status));

  function dismiss(id: string) {
    dispatch({ type: "SET_FLAG_STATUS", flagId: id, status: "Dismissed" });
    toast("Flag dismissed");
    setReviewing(null);
  }

  function confirmBan() {
    if (!reviewing) return;
    dispatch({ type: "SET_ACCOUNT_STATUS", userId: reviewing.userId, status: "Banned" });
    dispatch({ type: "SET_FLAG_STATUS", flagId: reviewing.id, status: "Reviewed" });
    toast("User banned");
    setBanConfirm(false);
    setReviewing(null);
    router.push(`/admin/users/${reviewing.userId}`);
  }

  if (state.flags.length === 0) return <EmptyState title="No flagged activity right now." />;

  return (
    <div className="space-y-5">
      <h1 className="gt-page-title">Flagged Activity</h1>
      <div className="flex gap-2 flex-wrap">
        {["All", "Low", "Medium", "High"].map((s) => (
          <button key={s} onClick={() => setSeverity(s)} className={`rounded-full border px-3 py-1 text-xs font-medium ${severity === s ? "border-brand-500 bg-brand-500/10 text-base-100" : "border-base-600 text-base-300"}`}>
            {s}
          </button>
        ))}
        {["All", "New", "Reviewed", "Dismissed"].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`rounded-full border px-3 py-1 text-xs font-medium ${status === s ? "border-brand-500 bg-brand-500/10 text-base-100" : "border-base-600 text-base-300"}`}>
            {s}
          </button>
        ))}
      </div>

      <Table>
        <THead>
          <Th>Type</Th>
          <Th>User</Th>
          <Th>Detected</Th>
          <Th>Severity</Th>
          <Th>Status</Th>
          <Th></Th>
        </THead>
        <TBody>
          {filtered.map((f) => {
            const user = state.users.find((u) => u.id === f.userId);
            return (
              <Tr key={f.id} onClick={() => setReviewing(f)}>
                <Td className="text-base-100">{f.type}</Td>
                <Td className="text-base-300">{user?.name}</Td>
                <Td className="text-base-400">{shortDate(f.detectedDate)}</Td>
                <Td>
                  <Badge tone={f.severity === "High" ? "danger" : f.severity === "Medium" ? "warning" : "neutral"}>{f.severity}</Badge>
                </Td>
                <Td>
                  <StatusBadge status={f.status} kind="flag" />
                </Td>
                <Td onClick={(e: any) => e.stopPropagation()}>
                  <button onClick={() => setReviewing(f)} className="gt-btn-secondary text-xs px-3 py-1.5">
                    Review
                  </button>
                </Td>
              </Tr>
            );
          })}
        </TBody>
        {filtered.map((f) => {
          const user = state.users.find((u) => u.id === f.userId);
          return (
            <MobileRow key={f.id} onClick={() => setReviewing(f)}>
              <div className="flex items-center justify-between">
                <p className="font-medium text-base-100 text-sm">{f.type}</p>
                <StatusBadge status={f.status} kind="flag" />
              </div>
              <MobileRowLine label="User" value={user?.name ?? ""} />
              <MobileRowLine label="Severity" value={f.severity} />
            </MobileRow>
          );
        })}
      </Table>

      <SideSheet open={!!reviewing} onClose={() => setReviewing(null)} title="Flag details">
        {reviewing && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-base-400">Type</p>
              <p className="text-sm text-base-100">{reviewing.type}</p>
            </div>
            <div>
              <p className="text-xs text-base-400">What triggered it</p>
              <p className="text-sm text-base-300">{reviewing.detail}</p>
            </div>
            <div className="rounded-lg bg-base-800/60 px-3 py-2 text-xs text-base-400">
              Activity log: login attempt 06:42 UTC · login attempt 06:45 UTC · account flagged 06:46 UTC
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => dismiss(reviewing.id)} className="gt-btn-secondary flex-1">
                Dismiss
              </button>
              <button onClick={() => setBanConfirm(true)} className="gt-btn-destructive flex-1">
                Ban user
              </button>
            </div>
          </div>
        )}
      </SideSheet>

      <ConfirmDialog
        open={banConfirm}
        onClose={() => setBanConfirm(false)}
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
