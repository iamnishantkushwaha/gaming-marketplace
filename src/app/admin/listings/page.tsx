"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useApp, useUserById } from "@/lib/store";
import { EmptyState } from "@/components/ui/Empty";
import { StatusBadge } from "@/components/ui/Badge";
import { Table, THead, TBody, Tr, Th, Td, MobileRow, MobileRowLine } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";

export default function AdminAllListingsPage() {
  const { state } = useApp();
  const router = useRouter();
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const filtered = state.listings.filter((l) => (category === "All" || l.category === category) && (status === "All" || l.status === status));

  return (
    <div className="space-y-5">
      <h1 className="gt-page-title">All Listings</h1>
      <div className="flex gap-3 flex-wrap">
        <Select
          className="w-44"
          value={category}
          onChange={(v) => setCategory(v)}
          options={[
            { value: "All", label: "All" },
            { value: "Accounts", label: "Accounts" },
            { value: "Currency", label: "Currency" },
            { value: "Boosting", label: "Boosting" },
            { value: "Items", label: "Items" },
            { value: "Top-up", label: "Top-up" },
          ]}
        />
        <Select
          className="w-44"
          value={status}
          onChange={(v) => setStatus(v)}
          options={[
            { value: "All", label: "All" },
            { value: "Active", label: "Active" },
            { value: "Paused", label: "Paused" },
            { value: "Pending review", label: "Pending review" },
            { value: "Rejected", label: "Rejected" },
            { value: "Removed", label: "Removed" },
            { value: "Draft", label: "Draft" },
          ]}
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No listings match your filters." />
      ) : (
        <Table>
          <THead>
            <Th>Title</Th>
            <Th>Seller</Th>
            <Th>Category</Th>
            <Th>Price</Th>
            <Th>Status</Th>
            <Th>Views</Th>
          </THead>
          <TBody>
            {filtered.map((l) => {
              const seller = state.users.find((u) => u.id === l.sellerId);
              return (
                <Tr key={l.id} onClick={() => router.push(`/admin/listings/${l.id}`)}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Image src={l.imageUrls[0]} alt="" width={40} height={40} className="rounded-lg object-cover" />
                      <span className="line-clamp-1 max-w-[220px] font-medium text-base-100">{l.title}</span>
                    </div>
                  </Td>
                  <Td className="text-base-300">{seller?.name}</Td>
                  <Td className="text-base-300">{l.category}</Td>
                  <Td className="text-base-100 font-medium">${l.price.toFixed(2)}</Td>
                  <Td>
                    <StatusBadge status={l.status} kind="listing" />
                  </Td>
                  <Td className="text-base-400">{l.views.toLocaleString()}</Td>
                </Tr>
              );
            })}
          </TBody>
          {filtered.map((l) => (
            <MobileRow key={l.id} onClick={() => router.push(`/admin/listings/${l.id}`)}>
              <div className="flex items-center gap-3">
                <Image src={l.imageUrls[0]} alt="" width={44} height={44} className="rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-base-100 text-sm line-clamp-1">{l.title}</p>
                  <p className="text-xs text-base-400">{l.category}</p>
                </div>
                <StatusBadge status={l.status} kind="listing" />
              </div>
              <MobileRowLine label="Price" value={`$${l.price.toFixed(2)}`} />
            </MobileRow>
          ))}
        </Table>
      )}
    </div>
  );
}
