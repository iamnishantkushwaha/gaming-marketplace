"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { useApp, useCurrentUser, useListingById, useUserById } from "@/lib/store";
import { OrderStatus } from "@/lib/types";
import { Tabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Empty";
import { Table, THead, TBody, Tr, Th, Td, MobileRow, MobileRowLine } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";
import { money, shortDate } from "@/lib/format";

type TabKey = "All" | OrderStatus;

export default function BuyerOrdersPage() {
  const { state } = useApp();
  const user = useCurrentUser();
  const [tab, setTab] = useState<TabKey>("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "price">("newest");

  const myOrders = useMemo(() => state.orders.filter((o) => o.buyerId === user?.id), [state.orders, user]);

  const filtered = useMemo(() => {
    let result = myOrders;
    if (tab !== "All") result = result.filter((o) => o.status === tab);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((o) => {
        const listing = state.listings.find((l) => l.id === o.listingId);
        return o.id.toLowerCase().includes(q) || listing?.title.toLowerCase().includes(q);
      });
    }
    const sorted = [...result];
    if (sort === "newest") sorted.sort((a, b) => new Date(b.placedDate).getTime() - new Date(a.placedDate).getTime());
    else if (sort === "oldest") sorted.sort((a, b) => new Date(a.placedDate).getTime() - new Date(b.placedDate).getTime());
    else sorted.sort((a, b) => b.amount - a.amount);
    return sorted;
  }, [myOrders, tab, search, sort, state.listings]);

  if (myOrders.length === 0) {
    return (
      <EmptyState
        title="You haven't placed any orders yet"
        description="Browse the marketplace to find your first account, currency, or boosting service."
        action={
          <Link href="/buyer" className="gt-btn-primary">
            Browse the marketplace
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="gt-page-title">My Orders</h1>
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
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          placeholder="Search by title or order ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="gt-input sm:max-w-xs"
        />
        <Select
          className="sm:w-52"
          value={sort}
          onChange={(v) => setSort(v as "newest" | "oldest" | "price")}
          options={[
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
            { value: "price", label: "Price: high to low" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No orders match your filters" />
      ) : (
        <Table>
          <THead>
            <Th>Listing</Th>
            <Th>Seller</Th>
            <Th>Price</Th>
            <Th>Status</Th>
            <Th>Date</Th>
            <Th></Th>
          </THead>
          <TBody>
            {filtered.map((o) => (
              <OrderRow key={o.id} orderId={o.id} />
            ))}
          </TBody>
          {filtered.map((o) => (
            <OrderMobileRow key={o.id} orderId={o.id} />
          ))}
        </Table>
      )}
    </div>
  );
}

function OrderRow({ orderId }: { orderId: string }) {
  const { state } = useApp();
  const order = state.orders.find((o) => o.id === orderId)!;
  const listing = useListingById(order.listingId);
  const seller = useUserById(order.sellerId);
  const router = useRouter();
  return (
    <Tr onClick={() => router.push(`/buyer/orders/${order.id}`)}>
      <Td>
        <div className="flex items-center gap-3">
          {listing && <Image src={listing.imageUrls[0]} alt="" width={40} height={40} className="rounded-lg object-cover" />}
          <span className="line-clamp-1 max-w-[220px] font-medium text-base-100">{listing?.title}</span>
        </div>
      </Td>
      <Td className="text-base-300">{seller?.name}</Td>
      <Td className="text-base-100 font-medium">{money(order.amount)}</Td>
      <Td>
        <StatusBadge status={order.status} kind="order" />
      </Td>
      <Td className="text-base-400">{shortDate(order.placedDate)}</Td>
      <Td onClick={(e: any) => e.stopPropagation()}>
        <Link href={`/buyer/messages`} className="text-base-400 hover:text-brand-400">
          <MessageSquare size={16} />
        </Link>
      </Td>
    </Tr>
  );
}

function OrderMobileRow({ orderId }: { orderId: string }) {
  const { state } = useApp();
  const order = state.orders.find((o) => o.id === orderId)!;
  const listing = useListingById(order.listingId);
  const seller = useUserById(order.sellerId);
  const router = useRouter();
  return (
    <MobileRow onClick={() => router.push(`/buyer/orders/${order.id}`)}>
      <div className="flex items-center gap-3">
        {listing && <Image src={listing.imageUrls[0]} alt="" width={44} height={44} className="rounded-lg object-cover" />}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 font-medium text-base-100 text-sm">{listing?.title}</p>
          <p className="text-xs text-base-400">{seller?.name}</p>
        </div>
        <StatusBadge status={order.status} kind="order" />
      </div>
      <MobileRowLine label="Price" value={money(order.amount)} />
      <MobileRowLine label="Date" value={shortDate(order.placedDate)} />
    </MobileRow>
  );
}
