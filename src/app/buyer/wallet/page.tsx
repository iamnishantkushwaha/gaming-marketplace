"use client";

import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useApp, useBalance, useCurrentUser } from "@/lib/store";
import { Tabs } from "@/components/ui/Tabs";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Empty";
import { Select } from "@/components/ui/Select";
import { genId, money, shortDate, todayDate } from "@/lib/format";
import { TransactionType } from "@/lib/types";

const METHODS = ["Credit/Debit Card via Stripe", "PayPal", "Google Pay", "Apple Pay", "Crypto"];

export default function WalletPage() {
  const { state, dispatch, toast } = useApp();
  const user = useCurrentUser();
  const balance = useBalance(user?.id);
  const [tab, setTab] = useState<"Transactions" | "Payment methods">("Transactions");
  const [typeFilter, setTypeFilter] = useState<"All" | TransactionType>("All");
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [amount, setAmount] = useState("25");
  const [method, setMethod] = useState(METHODS[0]);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const myTx = state.transactions.filter((t) => t.userId === user?.id);
  const filteredTx = typeFilter === "All" ? myTx : myTx.filter((t) => t.type === typeFilter);
  const myMethods = state.paymentMethods.filter((m) => m.userId === user?.id);
  const defaultMethod = myMethods.find((m) => m.isDefault) ?? myMethods[0];

  const summary = useMemo(() => {
    const totalSpent = myTx.filter((t) => t.type === "Purchase").reduce((s, t) => s + Math.abs(t.amount), 0);
    const totalTopUps = myTx.filter((t) => t.type === "Top-up").reduce((s, t) => s + t.amount, 0);
    const orderCount = state.orders.filter((o) => o.buyerId === user?.id).length;
    return { totalSpent, totalTopUps, orderCount };
  }, [myTx, state.orders, user]);

  function addFunds() {
    const amt = Number(amount) || 0;
    if (!user || amt <= 0) return;
    dispatch({ type: "ADJUST_BALANCE", userId: user.id, delta: amt });
    dispatch({
      type: "ADD_TRANSACTION",
      transaction: { id: genId("t"), userId: user.id, type: "Top-up", amount: amt, status: "Completed", date: todayDate(), method },
    });
    setAddFundsOpen(false);
    toast("Funds added");
  }

  function removeMethod() {
    if (removeTarget) dispatch({ type: "REMOVE_PAYMENT_METHOD", methodId: removeTarget });
    setRemoveTarget(null);
  }

  function addCard() {
    if (!user) return;
    dispatch({
      type: "ADD_PAYMENT_METHOD",
      method: { id: genId("pm"), userId: user.id, label: "Card", masked: `•••• ${Math.floor(1000 + Math.random() * 9000)}`, isDefault: false },
    });
    setAddCardOpen(false);
    toast("Payment method saved");
  }

  return (
    <div className="space-y-6">
      <h1 className="gt-page-title">Wallet</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="gt-card p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs text-base-400">Available balance</p>
              <p className="text-3xl font-bold tracking-tightish text-base-100">{money(balance)}</p>
            </div>
            <button onClick={() => setAddFundsOpen(true)} className="gt-btn-primary">
              Add funds
            </button>
          </div>

          <Tabs value={tab} onChange={setTab} tabs={[{ label: "Transactions", value: "Transactions" }, { label: "Payment methods", value: "Payment methods" }]} />

          {tab === "Transactions" && (
        <div className="space-y-4">
          <Select
            className="w-48"
            value={typeFilter}
            onChange={(v) => setTypeFilter(v as "All" | TransactionType)}
            options={[
              { value: "All", label: "All" },
              { value: "Purchase", label: "Purchases" },
              { value: "Refund", label: "Refunds" },
              { value: "Top-up", label: "Top-ups" },
            ]}
          />
          {filteredTx.length === 0 ? (
            <EmptyState title="No transactions yet" />
          ) : (
            <div className="gt-card divide-y divide-base-700">
              {filteredTx.map((t) => (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-base-100 font-medium truncate">{t.description ?? t.type}</p>
                    <p className="text-xs text-base-400">{shortDate(t.date)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap justify-end">
                    <Badge tone="neutral">{t.type}</Badge>
                    <span className={t.amount < 0 ? "text-base-100" : "text-accent-green"}>{money(t.amount)}</span>
                    <StatusBadge status={t.status} kind="transaction" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "Payment methods" && (
        <div className="space-y-4">
          {myMethods.length === 0 && <EmptyState title="No saved payment methods" />}
          <div className="grid gap-3">
            {myMethods.map((m) => (
              <div key={m.id} className="gt-card flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-base-100 truncate">
                    {m.label} {m.masked}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {m.isDefault && <Badge tone="brand">Default</Badge>}
                  <button onClick={() => setRemoveTarget(m.id)} className="text-xs font-medium text-accent-rose hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setAddCardOpen(true)} className="gt-btn-secondary">
            Add payment method
          </button>
        </div>
      )}
        </div>

        <div className="space-y-4">
          <div className="gt-card p-5 space-y-3">
            <h2 className="gt-eyebrow">Wallet summary</h2>
            <SummaryRow label="Total spent" value={money(summary.totalSpent)} />
            <SummaryRow label="Total top-ups" value={money(summary.totalTopUps)} />
            <SummaryRow label="Orders placed" value={String(summary.orderCount)} />
          </div>

          <div className="gt-card p-5 space-y-2">
            <h2 className="gt-eyebrow">Default payment method</h2>
            {defaultMethod ? (
              <p className="text-sm text-base-200">
                {defaultMethod.label} {defaultMethod.masked}
              </p>
            ) : (
              <p className="text-sm text-base-400">No payment method saved yet.</p>
            )}
            <button onClick={() => setTab("Payment methods")} className="gt-link text-xs font-medium">
              Manage payment methods
            </button>
          </div>

          <div className="gt-card p-5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-base-100">
              <ShieldCheck size={15} className="text-accent-green shrink-0" />
              Escrow protected
            </div>
            <p className="text-xs text-base-400 leading-relaxed">
              Funds for every purchase are held in escrow until delivery is confirmed, so your balance is always
              protected until you get what you paid for.
            </p>
          </div>
        </div>
      </div>

      <Modal
        open={addFundsOpen}
        onClose={() => setAddFundsOpen(false)}
        title="Add funds"
        footer={
          <>
            <button className="gt-btn-secondary" onClick={() => setAddFundsOpen(false)}>
              Cancel
            </button>
            <button className="gt-btn-primary" onClick={addFunds}>
              Confirm
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="gt-input" placeholder="Amount" />
          <div className="grid grid-cols-1 gap-2">
            {METHODS.map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`rounded-lg border px-3 py-2 text-left text-sm ${method === m ? "border-brand-500 bg-brand-500/10 text-base-100" : "border-base-600 text-base-300"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        open={addCardOpen}
        onClose={() => setAddCardOpen(false)}
        title="Add payment method"
        footer={
          <>
            <button className="gt-btn-secondary" onClick={() => setAddCardOpen(false)}>
              Cancel
            </button>
            <button className="gt-btn-primary" onClick={addCard}>
              Save
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <input placeholder="Card number" className="gt-input" />
          <div className="flex gap-3">
            <input placeholder="Expiry" className="gt-input" />
            <input placeholder="CVC" className="gt-input" />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={removeMethod}
        title="Remove this payment method?"
        message="You can add it again later if needed."
        confirmLabel="Remove"
      />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-base-400">{label}</span>
      <span className="font-medium text-base-100">{value}</span>
    </div>
  );
}
