"use client";

import { useState } from "react";
import { useApp, useBalance, useCurrentUser } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Empty";
import { Select } from "@/components/ui/Select";
import { genId, money, shortDate, todayDate } from "@/lib/format";

export default function SellerPayoutsPage() {
  const { state, dispatch, toast } = useApp();
  const user = useCurrentUser();
  const balance = useBalance(user?.id);
  const pendingClearance = state.orders
    .filter((o) => o.sellerId === user?.id && (o.status === "Pending" || o.status === "Delivered"))
    .reduce((s, o) => s + (o.amount - o.commission), 0);

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(balance.toFixed(2));
  const [method, setMethod] = useState("Bank transfer");
  const [detailFor, setDetailFor] = useState<string | null>(null);

  const payouts = state.transactions.filter((t) => t.userId === user?.id && t.type === "Payout");

  function requestPayout() {
    const amt = Number(amount) || 0;
    if (!user || amt <= 0 || amt > balance) return;
    dispatch({ type: "ADJUST_BALANCE", userId: user.id, delta: -amt });
    dispatch({
      type: "ADD_TRANSACTION",
      transaction: { id: genId("t"), userId: user.id, type: "Payout", amount: amt, commission: 0, status: "Processing", date: todayDate(), method },
    });
    setOpen(false);
    toast("Payout requested");
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="gt-page-title">Balance & Payouts</h1>

      <div className="gt-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-6 sm:gap-8">
          <div>
            <p className="text-xs text-base-400">Available</p>
            <p className="gt-stat-value">{money(balance)}</p>
          </div>
          <div>
            <p className="text-xs text-base-400">Pending clearance</p>
            <p className="text-2xl font-bold text-base-300">{money(pendingClearance)}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setAmount(balance.toFixed(2));
            setOpen(true);
          }}
          disabled={balance <= 0}
          className="gt-btn-primary"
        >
          Request payout
        </button>
      </div>

      {payouts.length === 0 ? (
        <EmptyState title="No payouts yet" />
      ) : (
        <div className="gt-card divide-y divide-base-700">
          {payouts.map((p) => (
            <button key={p.id} onClick={() => setDetailFor(p.id)} className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left text-sm hover:bg-base-800/60">
              <div>
                <p className="text-base-100 font-medium">{p.method}</p>
                <p className="text-xs text-base-400">{shortDate(p.date)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base-200">{money(p.amount)}</span>
                <StatusBadge status={p.status} kind="transaction" />
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Request payout"
        footer={
          <>
            <button className="gt-btn-secondary" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="gt-btn-primary" onClick={requestPayout}>
              Confirm payout
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-medium text-base-300">Amount</p>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="gt-input" />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-base-300">Payout method</p>
            <Select
              value={method}
              onChange={(v) => setMethod(v)}
              options={[
                { value: "Bank transfer", label: "Bank transfer" },
                { value: "PayPal", label: "PayPal" },
                { value: "Crypto wallet", label: "Crypto wallet" },
              ]}
            />
          </div>
        </div>
      </Modal>

      <Modal open={!!detailFor} onClose={() => setDetailFor(null)} title="Payout breakdown">
        {(() => {
          const p = payouts.find((x) => x.id === detailFor);
          if (!p) return null;
          const gross = p.amount / 0.9;
          return (
            <div className="space-y-2 text-sm">
              <Row label="Gross amount" value={money(gross)} />
              <Row label="Platform commission" value="10%" />
              <Row label="Net paid out" value={money(p.amount)} />
            </div>
          );
        })()}
      </Modal>
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
