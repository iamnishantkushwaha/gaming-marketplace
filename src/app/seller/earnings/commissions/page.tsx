"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp, useCurrentUser } from "@/lib/store";
import { EmptyState } from "@/components/ui/Empty";
import { Table, THead, TBody, Tr, Th, Td, MobileRow, MobileRowLine } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";
import { money, shortDate } from "@/lib/format";

export default function SellerCommissionHistoryPage() {
  const { state } = useApp();
  const user = useCurrentUser();
  const router = useRouter();
  const [range, setRange] = useState<"This month" | "Last month" | "All time">("All time");

  const myOrders = useMemo(
    () => state.orders.filter((o) => o.sellerId === user?.id && (o.status === "Completed" || o.status === "Delivered")),
    [state.orders, user]
  );

  const totalSales = myOrders.reduce((s, o) => s + o.amount, 0);
  const totalCommission = myOrders.reduce((s, o) => s + o.commission, 0);
  const netEarnings = totalSales - totalCommission;

  if (myOrders.length === 0) return <EmptyState title="No sales yet" />;

  return (
    <div className="space-y-5">
      <h1 className="gt-page-title">Commission History</h1>
      <Select
        className="w-44"
        value={range}
        onChange={(v) => setRange(v as "This month" | "Last month" | "All time")}
        options={[
          { value: "This month", label: "This month" },
          { value: "Last month", label: "Last month" },
          { value: "All time", label: "All time" },
        ]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat label="Total sales" value={money(totalSales)} />
        <Stat label="Total commission paid" value={money(totalCommission)} />
        <Stat label="Net earnings" value={money(netEarnings)} />
      </div>
      <Table>
        <THead>
          <Th>Order ID</Th>
          <Th>Listing</Th>
          <Th>Sale amount</Th>
          <Th>Commission %</Th>
          <Th>Commission</Th>
          <Th>Net earned</Th>
          <Th>Date</Th>
        </THead>
        <TBody>
          {myOrders.map((o) => {
            const listing = state.listings.find((l) => l.id === o.listingId);
            const pct = ((o.commission / o.amount) * 100).toFixed(0);
            return (
              <Tr key={o.id} onClick={() => router.push(`/seller/orders/${o.id}`)}>
                <Td className="text-brand-400">{o.id}</Td>
                <Td className="max-w-[220px]">
                  <p className="truncate text-base-300">{listing?.title}</p>
                </Td>
                <Td className="text-base-100">{money(o.amount)}</Td>
                <Td className="text-base-400">{pct}%</Td>
                <Td className="text-base-400">{money(o.commission)}</Td>
                <Td className="text-base-100 font-medium">{money(o.amount - o.commission)}</Td>
                <Td className="text-base-400">{shortDate(o.placedDate)}</Td>
              </Tr>
            );
          })}
        </TBody>
        {myOrders.map((o) => {
          const listing = state.listings.find((l) => l.id === o.listingId);
          return (
            <MobileRow key={o.id} onClick={() => router.push(`/seller/orders/${o.id}`)}>
              <p className="font-medium text-base-100 text-sm line-clamp-1">{listing?.title}</p>
              <MobileRowLine label="Sale" value={money(o.amount)} />
              <MobileRowLine label="Net" value={money(o.amount - o.commission)} />
              <MobileRowLine label="Date" value={shortDate(o.placedDate)} />
            </MobileRow>
          );
        })}
      </Table>
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
