"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { useApp } from "@/lib/store";
import { Select } from "@/components/ui/Select";
import { money } from "@/lib/format";

export default function AdminDashboard() {
  const { state } = useApp();
  const router = useRouter();
  const [range, setRange] = useState<"Today" | "7" | "30" | "90">("30");

  const gmv = state.orders.reduce((s, o) => s + o.amount, 0);
  const commission = state.orders.reduce((s, o) => s + o.commission, 0);
  const activeUsers = state.users.filter((u) => u.accountStatus === "Active").length;
  const openDisputes = state.disputes.filter((d) => d.status !== "Resolved").length;
  const pendingListings = state.listings.filter((l) => l.status === "Pending review");
  const flaggedAccounts = state.flags.filter((f) => f.status === "New");

  const chartData = useMemo(() => {
    const days = range === "Today" ? 1 : Number(range);
    return Array.from({ length: Math.min(days, 14) || 1 }, (_, i) => ({
      day: `Day ${i + 1}`,
      gmv: Math.round(800 + Math.sin(i / 2) * 300 + i * 40),
      commission: Math.round(80 + Math.sin(i / 2) * 30 + i * 4),
    }));
  }, [range]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="gt-page-title">Admin Dashboard</h1>
        <Select
          className="w-40"
          value={range}
          onChange={(v) => setRange(v as "Today" | "7" | "30" | "90")}
          options={[
            { value: "Today", label: "Today" },
            { value: "7", label: "7 days" },
            { value: "30", label: "30 days" },
            { value: "90", label: "90 days" },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="gt-card p-4">
          <p className="text-xs text-base-400">Gross merchandise value</p>
          <p className="mt-1.5 gt-stat-value">{money(gmv)}</p>
        </div>
        <button onClick={() => router.push("/admin/payments/commissions")} className="gt-card p-4 text-left hover:border-brand-500/50">
          <p className="text-xs text-base-400">Platform commission earned</p>
          <p className="mt-1.5 gt-stat-value">{money(commission)}</p>
        </button>
        <button onClick={() => router.push("/admin/users?status=Active")} className="gt-card p-4 text-left hover:border-brand-500/50">
          <p className="text-xs text-base-400">Active users</p>
          <p className="mt-1.5 gt-stat-value">{activeUsers}</p>
        </button>
        <button onClick={() => router.push("/admin/disputes")} className="gt-card p-4 text-left hover:border-brand-500/50">
          <p className="text-xs text-base-400">Open disputes</p>
          <p className="mt-1.5 gt-stat-value">{openDisputes}</p>
        </button>
      </div>

      <div className="gt-card p-5">
        <h2 className="mb-3 text-sm font-semibold text-base-100">GMV / commission trend</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262a3a" />
            <XAxis dataKey="day" stroke="#6b7288" fontSize={11} tickLine={false} />
            <YAxis stroke="#6b7288" fontSize={11} tickLine={false} />
            <Tooltip contentStyle={{ background: "#161822", border: "1px solid #333849", borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="gmv" name="GMV" stroke="#e8630f" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="commission" name="Commission" stroke="#2dd4bf" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-base-100">Pending listing approvals</h2>
          <div className="gt-card divide-y divide-base-700">
            {pendingListings.length === 0 && <p className="px-4 py-4 text-sm text-base-400">Nothing pending.</p>}
            {pendingListings.map((l) => (
              <button
                key={l.id}
                onClick={() => router.push("/admin/listings/moderation")}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-base-800/60"
              >
                <span className="text-base-100 line-clamp-1">{l.title}</span>
                <span className="text-base-400 text-xs">{l.category}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-base-100">Flagged accounts</h2>
          <div className="gt-card divide-y divide-base-700">
            {flaggedAccounts.length === 0 && <p className="px-4 py-4 text-sm text-base-400">Nothing flagged.</p>}
            {flaggedAccounts.map((f) => {
              const u = state.users.find((x) => x.id === f.userId);
              return (
                <button
                  key={f.id}
                  onClick={() => router.push("/admin/security")}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-base-800/60"
                >
                  <span className="text-base-100">{u?.name}</span>
                  <span className="text-base-400 text-xs">{f.type}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
