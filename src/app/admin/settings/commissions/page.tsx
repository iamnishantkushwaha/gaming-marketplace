"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";

export default function AdminCommissionRatesPage() {
  const { state, dispatch, toast } = useApp();
  const [rates, setRates] = useState<Record<string, number>>(
    Object.fromEntries(state.categories.map((c) => [c.id, c.commissionRate]))
  );

  function save() {
    Object.entries(rates).forEach(([id, rate]) => {
      dispatch({ type: "UPDATE_CATEGORY", categoryId: id, patch: { commissionRate: rate } });
    });
    toast("Commission rates updated");
  }

  return (
    <div className="max-w-md space-y-5">
      <h1 className="gt-page-title">Commission Rates</h1>
      <div className="gt-card p-5 space-y-4">
        {state.categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-3">
            <span className="text-sm text-base-200">{c.name}</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                className="gt-input w-20 text-right"
                value={rates[c.id] ?? c.commissionRate}
                onChange={(e) => setRates({ ...rates, [c.id]: Number(e.target.value) })}
              />
              <span className="text-sm text-base-400">%</span>
            </div>
          </div>
        ))}
        <button onClick={save} className="gt-btn-primary w-full">
          Save rates
        </button>
      </div>
    </div>
  );
}
