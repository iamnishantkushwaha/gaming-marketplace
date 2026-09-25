"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Star } from "lucide-react";
import { useApp, useBalance, useCurrentUser } from "@/lib/store";
import { StatusBadge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/Stars";
import { EmptyState } from "@/components/ui/Empty";
import { Select } from "@/components/ui/Select";
import { money, shortDate } from "@/lib/format";

export default function SellerDashboard() {
  const { state } = useApp();
  const user = useCurrentUser();
  const balance = useBalance(user?.id);
  const router = useRouter();
  const [range, setRange] = useState<"7" | "30" | "90">("30");

  const myListings = state.listings.filter((l) => l.sellerId === user?.id);
  const myOrders = state.orders.filter((o) => o.sellerId === user?.id);
  const activeListings = myListings.filter((l) => l.status === "Active");
  const pendingOrders = myOrders.filter((o) => o.status === "Pending");
  const attentionOrders = myOrders.filter((o) => o.status === "Pending" || o.status === "Disputed");
  const myReviews = state.reviews.filter((r) => r.subjectId === user?.id).slice(0, 3);

  const chartData = useMemo(() => {
    const days = Number(range);
    return Array.from({ length: Math.min(days, 14) }, (_, i) => {
      const base = 40 + Math.sin(i / 2) * 25 + i * 1.5;
      return { day: `Day ${i + 1}`, earnings: Math.max(5, Math.round(base)) };
    });
  }, [range]);

  if (myListings.length === 0) {
    return (
      <EmptyState
        title="You haven't listed anything yet"
        description="Create your first listing to start selling on GameTrade."
        action={
          <Link href="/seller/listings/new" className="gt-btn-primary">
            Create your first listing
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="gt-page-title">Seller Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active listings" value={String(activeListings.length)} onClick={() => router.push("/seller/listings")} />
        <StatCard label="Pending orders" value={String(pendingOrders.length)} onClick={() => router.push("/seller/orders")} />
        <StatCard label="Available balance" value={money(balance)} onClick={() => router.push("/seller/earnings/payouts")} />
        <StatCard
          label="Seller rating"
          value={
            <span className="inline-flex items-center gap-1">
              {user?.rating ?? "—"} <Star size={16} className="fill-accent-amber text-accent-amber" /> ({user?.reviewCount ?? 0})
            </span>
          }
          onClick={() => router.push("/seller/reviews")}
        />
      </div>

      <div className="gt-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-base-100">Earnings trend</h2>
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
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262a3a" />
            <XAxis dataKey="day" stroke="#6b7288" fontSize={11} tickLine={false} />
            <YAxis stroke="#6b7288" fontSize={11} tickLine={false} />
            <Tooltip contentStyle={{ background: "#161822", border: "1px solid #333849", borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="earnings" stroke="#e8630f" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-base-100">Orders needing attention</h2>
          {attentionOrders.length === 0 ? (
            <EmptyState title="Nothing needs attention right now" />
          ) : (
            <div className="gt-card divide-y divide-base-700">
              {attentionOrders.map((o) => {
                const buyer = state.users.find((u) => u.id === o.buyerId);
                const listing = state.listings.find((l) => l.id === o.listingId);
                return (
                  <button
                    key={o.id}
                    onClick={() => router.push(`/seller/orders/${o.id}`)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-base-800/60"
                  >
                    <div>
                      <p className="text-base-100 font-medium">{buyer?.name}</p>
                      <p className="text-xs text-base-400">{listing?.title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base-200">{money(o.amount)}</span>
                      <StatusBadge status={o.status} kind="order" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-base-100">Recent reviews</h2>
            <Link href="/seller/reviews" className="gt-link text-xs font-medium">
              See all
            </Link>
          </div>
          <div className="gt-card divide-y divide-base-700">
            {myReviews.map((r) => {
              const author = state.users.find((u) => u.id === r.authorId);
              return (
                <div key={r.id} className="px-4 py-3 text-sm">
                  <p className="font-medium text-base-100">{author?.name}</p>
                  <div className="mt-0.5">
                    <StarRating value={r.rating} size={12} />
                  </div>
                  <p className="mt-1 text-base-300 line-clamp-2">{r.comment}</p>
                </div>
              );
            })}
            {myReviews.length === 0 && <p className="px-4 py-6 text-center text-sm text-base-400">No reviews yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, onClick }: { label: string; value: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="gt-card p-4 text-left hover:border-brand-500/50 transition-colors">
      <p className="text-xs text-base-400">{label}</p>
      <p className="mt-1.5 gt-stat-value">{value}</p>
    </button>
  );
}
