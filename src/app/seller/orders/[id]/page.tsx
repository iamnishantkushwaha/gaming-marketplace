"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useApp, useCurrentUser, useOrderById, useListingById, useUserById, useConversationMessages, useDisputeByOrderId } from "@/lib/store";
import { genId, money, nowIso } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import { OrderStatusTimeline } from "@/components/shared/OrderTimeline";
import { Modal } from "@/components/ui/Modal";

export default function SellerOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const order = useOrderById(params.id);
  const { state, dispatch, toast } = useApp();
  const user = useCurrentUser();
  const listing = useListingById(order?.listingId);
  const buyer = useUserById(order?.buyerId);
  const router = useRouter();
  const dispute = useDisputeByOrderId(order?.id);

  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [responseText, setResponseText] = useState(dispute?.sellerResponse ?? "");

  const existingConv = state.conversations.find((c) => c.relatedOrderId === order?.id && c.participantIds.includes(buyer?.id ?? ""));
  const previewMessages = useConversationMessages(existingConv?.id).slice(-2);

  if (!order || !listing || !buyer || !user) return null;

  const needsDeliveryDetails = listing.category === "Accounts" || listing.category === "Currency";

  function markDelivered() {
    if (needsDeliveryDetails) {
      setDeliveryOpen(true);
    } else {
      doMarkDelivered("");
    }
  }

  function doMarkDelivered(deliveryNotes: string) {
    dispatch({ type: "SET_ORDER_STATUS", orderId: order!.id, status: "Delivered", extra: { deliveryNotes } });
    setDeliveryOpen(false);
    toast("Buyer notified — awaiting confirmation");
  }

  function messageBuyer() {
    let conv = existingConv;
    if (!conv) {
      conv = { id: genId("conv"), participantIds: [user!.id, buyer!.id], relatedOrderId: order!.id, relatedListingId: listing!.id, lastMessageAt: nowIso() };
      dispatch({ type: "START_CONVERSATION", conversation: conv });
    }
    router.push(`/seller/messages/${conv.id}`);
  }

  function submitDisputeResponse() {
    if (!dispute) return;
    dispatch({ type: "RESPOND_DISPUTE", disputeId: dispute.id, response: responseText });
    toast("Response sent to support");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-base-400">Order {order.id}</p>
          <h1 className="text-lg font-semibold text-base-100">{listing.title}</h1>
        </div>
        <StatusBadge status={order.status} kind="order" />
      </div>

      <div className="gt-card p-5">
        <OrderStatusTimeline order={order} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="gt-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-base-100">Listing summary</h2>
            <div className="flex gap-3">
              <Image src={listing.imageUrls[0]} alt="" width={72} height={72} className="rounded-lg object-cover" />
              <div className="text-sm space-y-1">
                <p className="font-medium text-base-100">{listing.title}</p>
                <p className="text-base-400">Price paid: <span className="text-base-200">{money(order.amount)}</span></p>
              </div>
            </div>
            {order.deliveryNotes && (
              <p className="mt-3 text-sm text-accent-teal">Delivery instructions sent to buyer</p>
            )}
          </div>

          {dispute && (
            <div className="gt-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-base-100">Respond to dispute</h2>
              <p className="text-xs text-base-400 mb-1">Buyer&apos;s reported reason</p>
              <p className="text-sm text-base-300 mb-3">{dispute.reason} — {dispute.buyerDetails}</p>
              {dispute.sellerResponse ? (
                <p className="text-sm text-base-200 rounded-lg bg-base-800/60 px-3 py-2">{dispute.sellerResponse}</p>
              ) : (
                <>
                  <textarea className="gt-input" rows={3} value={responseText} onChange={(e) => setResponseText(e.target.value)} placeholder="Your response..." />
                  <button onClick={submitDisputeResponse} className="gt-btn-primary mt-3">
                    Submit response
                  </button>
                </>
              )}
            </div>
          )}

          {existingConv && (
            <div className="gt-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-base-100">Recent messages</h2>
              <div className="space-y-2">
                {previewMessages.map((m) => (
                  <p key={m.id} className="text-sm text-base-300">
                    <span className="font-medium text-base-200">{m.senderId === user.id ? "You" : buyer.name}: </span>
                    {m.text}
                  </p>
                ))}
                {previewMessages.length === 0 && <p className="text-sm text-base-400">No messages yet.</p>}
              </div>
              <button onClick={messageBuyer} className="gt-link text-sm font-medium mt-3">
                Open full conversation
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="gt-card p-5">
            <h2 className="mb-2 text-sm font-semibold text-base-100">Escrow status</h2>
            <p className="text-sm text-base-300">
              {order.escrowHolder === "Platform escrow" ? "Funds held in escrow — released once buyer confirms" : order.escrowHolder === "Seller paid" ? "Funds released to you" : "Funds refunded to buyer"}
            </p>
          </div>
          <div className="gt-card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Image src={buyer.avatarUrl} alt={buyer.name} width={36} height={36} className="rounded-full" />
              <p className="text-sm font-medium text-base-100">{buyer.name}</p>
            </div>
            <button onClick={messageBuyer} className="gt-btn-secondary w-full">
              Message
            </button>
          </div>
          {order.status === "Pending" && (
            <button onClick={markDelivered} className="gt-btn-primary w-full py-2.5">
              Mark as delivered
            </button>
          )}
        </div>
      </div>

      <Modal
        open={deliveryOpen}
        onClose={() => setDeliveryOpen(false)}
        title="Enter delivery details"
        footer={
          <>
            <button className="gt-btn-secondary" onClick={() => setDeliveryOpen(false)}>
              Cancel
            </button>
            <button className="gt-btn-primary" onClick={() => doMarkDelivered(notes)}>
              Confirm
            </button>
          </>
        }
      >
        <textarea
          className="gt-input"
          rows={4}
          placeholder={listing.category === "Accounts" ? "Account credentials" : "Currency delivery notes"}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Modal>
    </div>
  );
}
