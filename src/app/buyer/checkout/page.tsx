"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { useApp, useCurrentUser, useListingById } from "@/lib/store";
import { genId, nowIso, todayDate } from "@/lib/format";
import { Order } from "@/lib/types";

const PAYMENT_METHODS = ["Credit/Debit Card", "PayPal", "Google Pay", "Apple Pay", "Crypto"] as const;

export default function CheckoutPage() {
  const { state, dispatch, toast } = useApp();
  const user = useCurrentUser();
  const router = useRouter();
  const listing = useListingById(state.checkoutContext?.listingId);
  const quantity = state.checkoutContext?.quantity;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]>("Credit/Debit Card");
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "" });
  const [newOrder, setNewOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!state.checkoutContext) {
      router.replace("/buyer");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!listing || !user) return null;

  const total = quantity ? listing.price * quantity : listing.price;
  const commissionRate = state.categories.find((c) => c.name === listing.category)?.commissionRate ?? 10;
  const commission = Number(((total * commissionRate) / 100).toFixed(2));

  function placeOrder() {
    const order: Order = {
      id: genId("o"),
      listingId: listing!.id,
      buyerId: user!.id,
      sellerId: listing!.sellerId,
      amount: total,
      commission,
      quantity,
      status: "Pending",
      placedDate: todayDate(),
      escrowHolder: "Platform escrow",
    };
    dispatch({ type: "PLACE_ORDER", order });
    dispatch({
      type: "ADD_TRANSACTION",
      transaction: {
        id: genId("t"),
        userId: user!.id,
        type: "Purchase",
        amount: -total,
        status: "Completed",
        date: todayDate(),
        description: listing!.title,
      },
    });
    setNewOrder(order);
    setStep(3);
    toast("Order placed");
  }

  function messageSeller() {
    if (!newOrder) return;
    let conv = state.conversations.find(
      (c) => c.participantIds.includes(user!.id) && c.participantIds.includes(newOrder.sellerId) && c.relatedOrderId === newOrder.id
    );
    if (!conv) {
      conv = {
        id: genId("conv"),
        participantIds: [user!.id, newOrder.sellerId],
        relatedOrderId: newOrder.id,
        relatedListingId: newOrder.listingId,
        lastMessageAt: nowIso(),
      };
      dispatch({ type: "START_CONVERSATION", conversation: conv });
    }
    dispatch({ type: "CLEAR_CHECKOUT_CONTEXT" });
    router.push(`/buyer/messages/${conv.id}`);
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 flex items-center justify-center gap-2 text-xs font-medium">
        {["Review order", "Payment", "Confirmation"].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                step === i + 1 ? "bg-brand-500 text-white" : step > i + 1 ? "bg-accent-green text-white" : "bg-base-800 text-base-400"
              }`}
            >
              {step > i + 1 ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span className={step === i + 1 ? "text-base-100" : "text-base-500"}>{label}</span>
            {i < 2 && <div className="h-px w-6 bg-base-700" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="gt-card p-6 space-y-5">
          <h1 className="text-lg font-semibold text-base-100">Review your order</h1>
          <div className="flex gap-3">
            <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-base-800">
              <Image src={listing.imageUrls[0]} alt={listing.title} fill className="object-cover" />
            </div>
            <div>
              <p className="text-sm font-medium text-base-100">{listing.title}</p>
              {quantity && <p className="text-xs text-base-400">Quantity: {quantity.toLocaleString()}</p>}
            </div>
          </div>
          <dl className="space-y-2 text-sm border-t border-base-700 pt-4">
            <Row label="Unit price" value={`$${listing.price.toFixed(2)}`} />
            <Row label="Platform fee" value={`$${commission.toFixed(2)}`} />
            <Row label="Total" value={`$${total.toFixed(2)}`} strong />
          </dl>
          <button onClick={() => setStep(2)} className="gt-btn-primary w-full py-2.5">
            Continue to payment
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="gt-card p-6 space-y-5">
          <h1 className="text-lg font-semibold text-base-100">Payment method</h1>
          <div className="grid grid-cols-1 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
                  method === m ? "border-brand-500 bg-brand-500/10 text-base-100" : "border-base-600 text-base-300 hover:border-base-500"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          {method === "Credit/Debit Card" && (
            <div className="space-y-3">
              <input
                placeholder="Card number"
                value={card.number}
                onChange={(e) => setCard({ ...card, number: e.target.value })}
                className="gt-input"
              />
              <div className="flex gap-3">
                <input
                  placeholder="Expiry"
                  value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                  className="gt-input"
                />
                <input
                  placeholder="CVC"
                  value={card.cvc}
                  onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                  className="gt-input"
                />
              </div>
            </div>
          )}
          <div className="rounded-lg border border-accent-teal/30 bg-accent-teal/5 px-3 py-2.5 text-xs text-accent-teal">
            Your payment is held securely until you confirm delivery
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="gt-btn-secondary flex-1">
              Back
            </button>
            <button onClick={placeOrder} className="gt-btn-primary flex-1">
              Place order
            </button>
          </div>
        </div>
      )}

      {step === 3 && newOrder && (
        <div className="gt-card p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-green/10 text-accent-green">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="text-lg font-semibold text-base-100">Order placed!</h1>
          <p className="text-sm text-base-400">Order ID: {newOrder.id}</p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => {
                dispatch({ type: "CLEAR_CHECKOUT_CONTEXT" });
                router.push(`/buyer/orders/${newOrder.id}`);
              }}
              className="gt-btn-primary"
            >
              Track your order
            </button>
            <button onClick={messageSeller} className="gt-btn-secondary">
              Message seller
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${strong ? "text-base font-semibold text-base-100" : "text-base-300"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
