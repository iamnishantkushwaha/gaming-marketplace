"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import {
  useApp,
  useCurrentUser,
  useOrderById,
  useListingById,
  useUserById,
  useConversationMessages,
  useDisputeByOrderId,
} from "@/lib/store";
import { genId, money, nowIso, todayDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import { OrderStatusTimeline } from "@/components/shared/OrderTimeline";
import { Modal } from "@/components/ui/Modal";
import { StarPicker, StarRating } from "@/components/ui/Stars";
import { Select } from "@/components/ui/Select";

export default function BuyerOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const order = useOrderById(params.id);
  const { state, dispatch, toast } = useApp();
  const user = useCurrentUser();
  const listing = useListingById(order?.listingId);
  const seller = useUserById(order?.sellerId);
  const router = useRouter();
  const dispute = useDisputeByOrderId(order?.id);

  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("Not delivered");
  const [details, setDetails] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const existingConv = state.conversations.find(
    (c) => c.relatedOrderId === order?.id && c.participantIds.includes(seller?.id ?? "")
  );
  const previewMessages = useConversationMessages(existingConv?.id).slice(-2);
  const existingReview = state.reviews.find((r) => r.orderId === order?.id);

  if (!order || !listing || !seller || !user) return null;

  function confirmDelivery() {
    dispatch({ type: "CONFIRM_DELIVERY", orderId: order!.id });
    toast("Delivery confirmed, funds released to seller");
  }

  function submitReport() {
    dispatch({ type: "SET_ORDER_STATUS", orderId: order!.id, status: "Disputed" });
    dispatch({
      type: "OPEN_DISPUTE",
      dispute: {
        id: genId("d"),
        orderId: order!.id,
        reason: reason as any,
        buyerDetails: details,
        internalNotes: [],
        status: "Open",
        openedDate: todayDate(),
      },
    });
    setReportOpen(false);
    toast("Report submitted — our support team will review");
  }

  function messageSeller() {
    let conv = existingConv;
    if (!conv) {
      conv = {
        id: genId("conv"),
        participantIds: [user.id, seller.id],
        relatedOrderId: order!.id,
        relatedListingId: listing!.id,
        lastMessageAt: nowIso(),
      };
      dispatch({ type: "START_CONVERSATION", conversation: conv });
    }
    router.push(`/buyer/messages/${conv.id}`);
  }

  function submitReview() {
    dispatch({
      type: "ADD_REVIEW",
      review: {
        id: genId("r"),
        orderId: order!.id,
        authorId: user.id,
        subjectId: seller.id,
        rating: reviewRating,
        comment: reviewComment,
        date: todayDate(),
      },
    });
    toast("Review submitted");
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
        {order.status === "Canceled" && order.cancelReason && (
          <p className="mt-3 text-sm text-base-400">Reason: {order.cancelReason}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="gt-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-base-100">Listing summary</h2>
            <div className="flex gap-3">
              <Link href={`/buyer/listing/${listing.id}`} className="shrink-0">
                <Image src={listing.imageUrls[0]} alt="" width={72} height={72} className="rounded-lg object-cover" />
              </Link>
              <div className="flex-1 space-y-1 text-sm">
                <Link href={`/buyer/listing/${listing.id}`} className="font-medium text-base-100 hover:text-brand-400">
                  {listing.title}
                </Link>
                {order.quantity && <p className="text-base-400">Quantity: {order.quantity.toLocaleString()}</p>}
                <p className="text-base-400">
                  Price paid: <span className="text-base-200">{money(order.amount)}</span>
                </p>
                <p className="text-base-400">
                  Platform fee: <span className="text-base-200">{money(order.commission)}</span>
                </p>
              </div>
            </div>
          </div>

          {order.status === "Completed" && !existingReview && (
            <div className="gt-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-base-100">Leave a review</h2>
              <StarPicker value={reviewRating} onChange={setReviewRating} />
              <textarea
                className="gt-input mt-3"
                rows={3}
                placeholder="How was your experience?"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
              <button disabled={reviewRating === 0} onClick={submitReview} className="gt-btn-primary mt-3">
                Submit review
              </button>
            </div>
          )}
          {existingReview && (
            <div className="gt-card p-5">
              <h2 className="mb-2 text-sm font-semibold text-base-100">Your review</h2>
              <StarRating value={existingReview.rating} size={16} />
              <p className="mt-1 text-sm text-base-300">{existingReview.comment}</p>
            </div>
          )}

          {existingConv && (
            <div className="gt-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-base-100">Recent messages</h2>
              <div className="space-y-2">
                {previewMessages.map((m) => (
                  <p key={m.id} className="text-sm text-base-300">
                    <span className="font-medium text-base-200">{m.senderId === user.id ? "You" : seller.name}: </span>
                    {m.text}
                  </p>
                ))}
                {previewMessages.length === 0 && <p className="text-sm text-base-400">No messages yet.</p>}
              </div>
              <button onClick={messageSeller} className="gt-link text-sm font-medium mt-3">
                Open full conversation
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="gt-card p-5">
            <h2 className="mb-2 text-sm font-semibold text-base-100">Escrow status</h2>
            <p className="text-sm text-base-300">
              {order.escrowHolder === "Platform escrow"
                ? `Funds held in escrow: ${money(order.amount)}`
                : order.escrowHolder === "Seller paid"
                ? "Funds released to seller"
                : "Funds refunded to buyer"}
            </p>
          </div>

          <div className="gt-card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Image src={seller.avatarUrl} alt={seller.name} width={36} height={36} className="rounded-full" />
              <div>
                <p className="text-sm font-medium text-base-100">{seller.name}</p>
                <p className="flex items-center gap-1 text-xs text-base-400">
                  {seller.rating} <Star size={11} className="fill-accent-amber text-accent-amber" /> rating
                </p>
              </div>
            </div>
            <button onClick={messageSeller} className="gt-btn-secondary w-full">
              Message
            </button>
          </div>

          {order.status === "Delivered" && (
            <button onClick={confirmDelivery} className="gt-btn-primary w-full py-2.5">
              Confirm delivery
            </button>
          )}
          {(order.status === "Pending" || order.status === "Delivered") && (
            <button onClick={() => setReportOpen(true)} className="gt-btn-secondary w-full py-2.5">
              Report an issue
            </button>
          )}
          {dispute && (
            <div className="gt-card p-4 text-sm">
              <p className="font-medium text-base-100 mb-1">Dispute status</p>
              <StatusBadge status={dispute.status} kind="dispute" />
            </div>
          )}
        </div>
      </div>

      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Report an issue with this order"
        footer={
          <>
            <button className="gt-btn-secondary" onClick={() => setReportOpen(false)}>
              Cancel
            </button>
            <button className="gt-btn-primary" disabled={!details.trim()} onClick={submitReport}>
              Submit report
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-medium text-base-300">Reason</p>
            <Select
              value={reason}
              onChange={(v) => setReason(v)}
              options={[
                { value: "Not delivered", label: "Not delivered" },
                { value: "Not as described", label: "Not as described" },
                { value: "Other", label: "Other" },
              ]}
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-base-300">Details</p>
            <textarea className="gt-input" rows={4} value={details} onChange={(e) => setDetails(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
