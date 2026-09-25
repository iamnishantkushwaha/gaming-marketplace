"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { OrderStatus } from "@/lib/types";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Empty";
import { Table, THead, TBody, Tr, Th, Td, MobileRow, MobileRowLine } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";
import { money, shortDate } from "@/lib/format";

export default function AdminOrdersPage() {
  const { state } = useApp();
  const router = useRouter();
  const [status, setStatus] = useState<"All" | OrderStatus>("All");
  const [search, setSearch] = useState("");

  const filtered = state.orders.filter((o) => {
    if (status !== "All" && o.status !== status) return false;
    if (search) {
      const buyer = state.users.find((u) => u.id === o.buyerId);
      const seller = state.users.find((u) => u.id === o.sellerId);
      const q = search.toLowerCase();
      return o.id.toLowerCase().includes(q) || buyer?.name.toLowerCase().includes(q) || seller?.name.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <h1 className="gt-page-title">All Orders</h1>
      <div className="flex gap-3 flex-wrap">
        <input placeholder="Search order ID, buyer, seller" value={search} onChange={(e) => setSearch(e.target.value)} className="gt-input sm:max-w-xs" />
        <Select
          className="w-44"
          value={status}
          onChange={(v) => setStatus(v as "All" | OrderStatus)}
          options={[
            { value: "All", label: "All statuses" },
            { value: "Pending", label: "Pending" },
            { value: "Delivered", label: "Delivered" },
            { value: "Completed", label: "Completed" },
            { value: "Disputed", label: "Disputed" },
            { value: "Canceled", label: "Canceled" },
          ]}
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No orders match your filters" />
      ) : (
        <Table>
          <THead>
            <Th>Order ID</Th>
            <Th>Buyer</Th>
            <Th>Seller</Th>
            <Th>Listing</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
            <Th>Date</Th>
          </THead>
          <TBody>
            {filtered.map((o) => {
              const buyer = state.users.find((u) => u.id === o.buyerId);
              const seller = state.users.find((u) => u.id === o.sellerId);
              const listing = state.listings.find((l) => l.id === o.listingId);
              return (
                <Tr key={o.id} onClick={() => router.push(`/admin/orders/${o.id}`)}>
                  <Td className="text-brand-400">{o.id}</Td>
                  <Td className="text-base-300">{buyer?.name}</Td>
                  <Td className="text-base-300">{seller?.name}</Td>
                  <Td className="max-w-[220px]">
                    <p className="truncate text-base-300">{listing?.title}</p>
                  </Td>
                  <Td className="text-base-100 font-medium">{money(o.amount)}</Td>
                  <Td>
                    <StatusBadge status={o.status} kind="order" />
                  </Td>
                  <Td className="text-base-400">{shortDate(o.placedDate)}</Td>
                </Tr>
              );
            })}
          </TBody>
          {filtered.map((o) => {
            const buyer = state.users.find((u) => u.id === o.buyerId);
            const seller = state.users.find((u) => u.id === o.sellerId);
            return (
              <MobileRow key={o.id} onClick={() => router.push(`/admin/orders/${o.id}`)}>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-base-100 text-sm">{o.id}</p>
                  <StatusBadge status={o.status} kind="order" />
                </div>
                <MobileRowLine label="Buyer" value={buyer?.name ?? ""} />
                <MobileRowLine label="Seller" value={seller?.name ?? ""} />
                <MobileRowLine label="Amount" value={money(o.amount)} />
              </MobileRow>
            );
          })}
        </Table>
      )}
    </div>
  );
}
