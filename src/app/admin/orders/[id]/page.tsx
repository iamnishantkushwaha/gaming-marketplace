"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useApp, useOrderById, useListingById, useUserById, useDisputeByOrderId } from "@/lib/store";
import { StatusBadge } from "@/components/ui/Badge";
import { OrderStatusTimeline } from "@/components/shared/OrderTimeline";
import { ConfirmDialog } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/Empty";
import { money } from "@/lib/format";

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const order = useOrderById(params.id);
  const listing = useListingById(order?.listingId);
  const buyer = useUserById(order?.buyerId);
  const seller = useUserById(order?.sellerId);
  const dispute = useDisputeByOrderId(order?.id);
  const { dispatch, toast } = useApp();
  const router = useRouter();
  const [action, setAction] = useState<"refund" | "release" | null>(null);
  const [reason, setReason] = useState("");

  if (!order || !listing || !buyer || !seller) return <EmptyState title="Order not found" />;

  function confirmAction() {
    if (action === "refund") {
      dispatch({ type: "SET_ORDER_STATUS", orderId: order!.id, status: "Canceled", extra: { escrowHolder: "Buyer refunded", cancelReason: reason } });
      toast("Buyer refunded");
    } else if (action === "release") {
      dispatch({ type: "SET_ORDER_STATUS", orderId: order!.id, status: "Completed", extra: { escrowHolder: "Seller paid" } });
      dispatch({ type: "ADJUST_BALANCE", userId: order!.sellerId, delta: order!.amount - order!.commission });
      toast("Funds released to seller");
    }
    setAction(null);
    setReason("");
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-semibold text-base-100">Order {order.id}</h1>
        <StatusBadge status={order.status} kind="order" />
      </div>

      <div className="gt-card p-5">
        <OrderStatusTimeline order={order} />
      </div>

      {dispute && (
        <button onClick={() => router.push(`/admin/disputes/${dispute.id}`)} className="flex w-full items-center justify-between gap-3 rounded-lg border border-accent-amber/40 bg-accent-amber/5 px-4 py-3 text-left text-sm text-accent-amber hover:bg-accent-amber/10">
          This order has an associated dispute — View dispute
          <ArrowRight size={15} className="shrink-0" />
        </button>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PartyCard label="Buyer" user={buyer} />
        <PartyCard label="Seller" user={seller} />
      </div>

      <div className="gt-card p-5">
        <h2 className="mb-3 text-sm font-semibold text-base-100">Escrow ledger</h2>
        <div className="space-y-2 text-sm">
          <Row label="Amount charged to buyer" value={money(order.amount)} />
          <Row label="Platform commission" value={money(order.commission)} />
          <Row label="Net to seller" value={money(order.amount - order.commission)} />
          <Row label="Current holder of funds" value={order.escrowHolder} />
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {(order.status === "Pending" || order.status === "Disputed") && (
          <button onClick={() => setAction("refund")} className="gt-btn-destructive">
            Force-refund buyer
          </button>
        )}
        {order.status === "Disputed" && (
          <button onClick={() => setAction("release")} className="gt-btn-primary">
            Force-release to seller
          </button>
        )}
      </div>

      <ConfirmDialog
        open={!!action}
        onClose={() => setAction(null)}
        onConfirm={confirmAction}
        title={action === "refund" ? "Force-refund the buyer?" : "Force-release funds to seller?"}
        message="This action affects escrow funds directly and cannot be undone."
        confirmLabel="Confirm"
        requireReason
        reason={reason}
        onReasonChange={setReason}
      />
    </div>
  );
}

function PartyCard({ label, user }: { label: string; user: any }) {
  return (
    <div className="gt-card p-4 flex items-center gap-3">
      <Image src={user.avatarUrl} alt={user.name} width={40} height={40} className="rounded-full" />
      <div>
        <p className="text-xs text-base-400">{label}</p>
        <p className="text-sm font-medium text-base-100">{user.name}</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-base-400">{label}</span>
      <span className="text-base-100 font-medium">{value}</span>
    </div>
  );
}
