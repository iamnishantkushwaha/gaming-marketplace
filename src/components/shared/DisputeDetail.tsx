"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeftRight } from "lucide-react";
import { useApp, useCurrentUser } from "@/lib/store";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Empty";
import { relativeTime } from "@/lib/format";

export function DisputeDetail({ disputeId }: { disputeId: string }) {
  const { state, dispatch, toast } = useApp();
  const user = useCurrentUser();
  const dispute = state.disputes.find((d) => d.id === disputeId);
  const [note, setNote] = useState("");

  if (!dispute) return <EmptyState title="Dispute not found" />;

  const order = state.orders.find((o) => o.id === dispute.orderId);
  const buyer = state.users.find((u) => u.id === order?.buyerId);
  const seller = state.users.find((u) => u.id === order?.sellerId);
  const listing = state.listings.find((l) => l.id === order?.listingId);

  function addNote() {
    if (!note.trim() || !user) return;
    dispatch({ type: "ADD_DISPUTE_NOTE", disputeId: dispute!.id, note: note.trim(), author: user.name });
    setNote("");
  }

  function resolve(resolution: "Refunded" | "Released") {
    dispatch({ type: "RESOLVE_DISPUTE", disputeId: dispute!.id, resolution });
    toast(resolution === "Refunded" ? "Dispute resolved — buyer refunded" : "Dispute resolved — released to seller");
  }

  function escalate() {
    dispatch({ type: "ESCALATE_DISPUTE", disputeId: dispute!.id });
    toast("Dispute escalated");
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-lg font-semibold text-base-100">Dispute · Order {dispute.orderId}</h1>
          <p className="flex items-center gap-1.5 text-xs text-base-400 mt-1">
            {buyer?.name} <ArrowLeftRight size={12} className="shrink-0" /> {seller?.name} · {listing?.title}
          </p>
        </div>
        <StatusBadge status={dispute.status} kind="dispute" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="gt-card p-5">
            <h2 className="mb-2 text-sm font-semibold text-base-100">Buyer&apos;s reported reason</h2>
            <p className="text-xs text-base-400 mb-1">{dispute.reason}</p>
            <p className="text-sm text-base-300">{dispute.buyerDetails}</p>
          </div>
          <div className="gt-card p-5">
            <h2 className="mb-2 text-sm font-semibold text-base-100">Seller&apos;s response</h2>
            {dispute.sellerResponse ? (
              <p className="text-sm text-base-300">{dispute.sellerResponse}</p>
            ) : (
              <p className="text-sm text-base-400">No response yet.</p>
            )}
          </div>
          <div className="gt-card p-5">
            <h2 className="mb-2 text-sm font-semibold text-base-100">Internal notes</h2>
            <div className="space-y-2 mb-3">
              {dispute.internalNotes.map((n, i) => (
                <div key={i} className="rounded-lg bg-base-800/60 px-3 py-2 text-xs">
                  <p className="text-base-200">{n.text}</p>
                  <p className="mt-1 text-base-400">
                    {n.author} · {relativeTime(n.date)}
                  </p>
                </div>
              ))}
              {dispute.internalNotes.length === 0 && <p className="text-sm text-base-400">No notes yet.</p>}
            </div>
            <textarea className="gt-input" rows={2} placeholder="Add an internal note..." value={note} onChange={(e) => setNote(e.target.value)} />
            <button onClick={addNote} className="gt-btn-secondary mt-2 text-xs px-3 py-1.5">
              Add note
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="gt-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-base-100">Order & parties</h2>
            <div className="space-y-2 text-sm">
              {buyer && <PartyRow label="Buyer" user={buyer} />}
              {seller && <PartyRow label="Seller" user={seller} />}
            </div>
          </div>

          {dispute.status !== "Resolved" ? (
            <div className="gt-card p-5 space-y-3">
              <h2 className="text-sm font-semibold text-base-100">Resolution</h2>
              <button onClick={() => resolve("Refunded")} className="gt-btn-destructive w-full">
                Resolve — refund buyer
              </button>
              <button onClick={() => resolve("Released")} className="gt-btn-primary w-full">
                Resolve — release to seller
              </button>
              {dispute.status !== "Under review" && (
                <button onClick={escalate} className="gt-btn-secondary w-full">
                  Escalate
                </button>
              )}
            </div>
          ) : (
            <div className="gt-card p-5">
              <p className="text-sm text-base-300">
                Resolved: <span className="font-medium text-base-100">{dispute.resolution}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PartyRow({ label, user }: { label: string; user: any }) {
  return (
    <div className="flex items-center gap-2.5">
      <Image src={user.avatarUrl} alt={user.name} width={28} height={28} className="rounded-full" />
      <div>
        <p className="text-xs text-base-400">{label}</p>
        <p className="text-base-100">{user.name}</p>
      </div>
    </div>
  );
}
