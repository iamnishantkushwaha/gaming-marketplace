"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useApp, useCurrentUser } from "@/lib/store";
import { OrderStatus } from "@/lib/types";
import { Tabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Empty";
import { Table, THead, TBody, Tr, Th, Td, MobileRow, MobileRowLine } from "@/components/ui/Table";
import { money, shortDate } from "@/lib/format";

type TabKey = "All" | OrderStatus;

export default function SellerOrdersPage() {
  const { state, dispatch, toast } = useApp();
  const user = useCurrentUser();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("All");
  const [search, setSearch] = useState("");

  const myOrders = useMemo(() => state.orders.filter((o) => o.sellerId === user?.id), [state.orders, user]);
  const filtered = myOrders.filter((o) => {
    if (tab !== "All" && o.status !== tab) return false;
    if (search) {
      const buyer = state.users.find((u) => u.id === o.buyerId);
      const listing = state.listings.find((l) => l.id === o.listingId);
      const q = search.toLowerCase();
      return buyer?.name.toLowerCase().includes(q) || listing?.title.toLowerCase().includes(q);
    }
    return true;
  });

  function markDelivered(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    dispatch({ type: "SET_ORDER_STATUS", orderId: id, status: "Delivered" });
    toast("Buyer notified — awaiting confirmation");
  }

  if (myOrders.length === 0) {
    return <EmptyState title="No orders yet" action={<a href="/seller/dashboard" className="gt-btn-primary">Back to dashboard</a>} />;
  }

  return (
    <div className="space-y-5">
      <h1 className="gt-page-title">Incoming Orders</h1>
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { label: "All", value: "All" },
          { label: "Pending", value: "Pending" },
          { label: "Delivered", value: "Delivered" },
          { label: "Completed", value: "Completed" },
          { label: "Disputed", value: "Disputed" },
          { label: "Canceled", value: "Canceled" },
        ]}
      />
      <input placeholder="Search by buyer or listing" value={search} onChange={(e) => setSearch(e.target.value)} className="gt-input sm:max-w-xs" />

      {filtered.length === 0 ? (
        <EmptyState title="No orders match your filters" />
      ) : (
        <Table>
          <THead>
            <Th>Buyer</Th>
            <Th>Listing</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
            <Th>Placed</Th>
            <Th></Th>
          </THead>
          <TBody>
            {filtered.map((o) => {
              const buyer = state.users.find((u) => u.id === o.buyerId);
              const listing = state.listings.find((l) => l.id === o.listingId);
              return (
                <Tr key={o.id} onClick={() => router.push(`/seller/orders/${o.id}`)}>
                  <Td>
                    <div className="flex items-center gap-2">
                      {buyer && <Image src={buyer.avatarUrl} alt="" width={28} height={28} className="rounded-full" />}
                      <span className="text-base-100 font-medium">{buyer?.name}</span>
                    </div>
                  </Td>
                  <Td className="max-w-[220px]">
                    <p className="truncate text-base-300">{listing?.title}</p>
                  </Td>
                  <Td className="text-base-100 font-medium">{money(o.amount)}</Td>
                  <Td>
                    <StatusBadge status={o.status} kind="order" />
                  </Td>
                  <Td className="text-base-400">{shortDate(o.placedDate)}</Td>
                  <Td onClick={(e: any) => e.stopPropagation()}>
                    {o.status === "Pending" && (
                      <button onClick={(e) => markDelivered(o.id, e)} className="gt-btn-secondary text-xs px-2.5 py-1.5">
                        Mark as delivered
                      </button>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </TBody>
          {filtered.map((o) => {
            const buyer = state.users.find((u) => u.id === o.buyerId);
            const listing = state.listings.find((l) => l.id === o.listingId);
            return (
              <MobileRow key={o.id} onClick={() => router.push(`/seller/orders/${o.id}`)}>
                <div className="flex items-center gap-3">
                  {buyer && <Image src={buyer.avatarUrl} alt="" width={36} height={36} className="rounded-full" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-base-100 text-sm">{buyer?.name}</p>
                    <p className="text-xs text-base-400 line-clamp-1">{listing?.title}</p>
                  </div>
                  <StatusBadge status={o.status} kind="order" />
                </div>
                <MobileRowLine label="Amount" value={money(o.amount)} />
                {o.status === "Pending" && (
                  <button onClick={(e) => markDelivered(o.id, e)} className="gt-btn-secondary w-full text-xs py-1.5 mt-1">
                    Mark as delivered
                  </button>
                )}
              </MobileRow>
            );
          })}
        </Table>
      )}
    </div>
  );
}
