"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { useApp } from "@/lib/store";
import { Select } from "@/components/ui/Select";
import { money } from "@/lib/format";

export default function AdminCommissionReportPage() {
  const { state } = useApp();
  const [range, setRange] = useState<"7" | "30" | "90">("30");

  const totalGMV = state.orders.reduce((s, o) => s + o.amount, 0);
  const totalCommission = state.orders.reduce((s, o) => s + o.commission, 0);
  const avgRate = totalGMV > 0 ? ((totalCommission / totalGMV) * 100).toFixed(1) : "0";

  const byCategory = useMemo(() => {
    return state.categories.map((c) => {
      const catOrders = state.orders.filter((o) => {
        const listing = state.listings.find((l) => l.id === o.listingId);
        return listing?.category === c.name;
      });
      return {
        category: c.name,
        gmv: catOrders.reduce((s, o) => s + o.amount, 0),
        commission: catOrders.reduce((s, o) => s + o.commission, 0),
      };
    });
  }, [state.categories, state.orders, state.listings]);

  const overTime = useMemo(() => {
    const days = Number(range);
    return Array.from({ length: Math.min(days, 14) }, (_, i) => ({
      day: `Day ${i + 1}`,
      commission: Math.round(20 + Math.sin(i / 2) * 10 + i),
    }));
  }, [range]);

  return (
    <div className="space-y-6">
      <h1 className="gt-page-title">Commission Report</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat label="Total GMV" value={money(totalGMV)} />
        <Stat label="Total commission" value={money(totalCommission)} />
        <Stat label="Average commission rate" value={`${avgRate}%`} />
      </div>

      <div className="gt-card p-5">
        <h2 className="mb-3 text-sm font-semibold text-base-100">Commission by category</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={byCategory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262a3a" />
            <XAxis dataKey="category" stroke="#6b7288" fontSize={11} tickLine={false} />
            <YAxis stroke="#6b7288" fontSize={11} tickLine={false} />
            <Tooltip contentStyle={{ background: "#161822", border: "1px solid #333849", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="gmv" name="GMV" fill="#e8630f" radius={[4, 4, 0, 0]} />
            <Bar dataKey="commission" name="Commission" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="gt-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-base-100">Commission over time</h2>
          <Select
            className="w-32"
            value={range}
            onChange={(v) => setRange(v as "7" | "30" | "90")}
            options={[
              { value: "7", label: "7 days" },
              { value: "30", label: "30 days" },
              { value: "90", label: "90 days" },
            ]}
          />
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={overTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262a3a" />
            <XAxis dataKey="day" stroke="#6b7288" fontSize={11} tickLine={false} />
            <YAxis stroke="#6b7288" fontSize={11} tickLine={false} />
            <Tooltip contentStyle={{ background: "#161822", border: "1px solid #333849", borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="commission" stroke="#f5b942" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="gt-card p-4">
      <p className="text-xs text-base-400">{label}</p>
      <p className="mt-1 gt-stat-value">{value}</p>
    </div>
  );
}
