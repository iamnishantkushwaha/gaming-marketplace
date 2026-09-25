"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MoreVertical } from "lucide-react";
import { useApp, useCurrentUser } from "@/lib/store";
import { ListingStatus } from "@/lib/types";
import { Tabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Empty";
import { Table, THead, TBody, Tr, Th, Td, MobileRow, MobileRowLine } from "@/components/ui/Table";
import { ConfirmDialog } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { money } from "@/lib/format";

type TabKey = "All" | "Active" | "Paused" | "Sold out";

export default function SellerListingsPage() {
  const { state, dispatch, toast } = useApp();
  const user = useCurrentUser();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("All");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const myListings = useMemo(() => state.listings.filter((l) => l.sellerId === user?.id), [state.listings, user]);

  const filtered = myListings.filter((l) => {
    if (tab !== "All" && l.status !== tab) return false;
    if (category !== "All" && l.category !== category) return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function toggleStatus(id: string, current: ListingStatus) {
    dispatch({ type: "UPDATE_LISTING", listingId: id, patch: { status: current === "Active" ? "Paused" : "Active" } });
    setMenuFor(null);
  }

  function deleteListing() {
    if (deleteTarget) {
      dispatch({ type: "DELETE_LISTING", listingId: deleteTarget });
      toast("Listing deleted");
    }
    setDeleteTarget(null);
  }

  if (myListings.length === 0) {
    return (
      <EmptyState
        title="No listings yet"
        action={
          <Link href="/seller/listings/new" className="gt-btn-primary">
            Create your first listing
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="gt-page-title">My Listings</h1>
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { label: "All", value: "All" },
          { label: "Active", value: "Active" },
          { label: "Paused", value: "Paused" },
          { label: "Sold out", value: "Sold out" },
        ]}
      />
      <div className="flex flex-col sm:flex-row gap-3">
        <input placeholder="Search listings" value={search} onChange={(e) => setSearch(e.target.value)} className="gt-input sm:max-w-xs" />
        <Select
          className="sm:w-48"
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
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No listings match your filters" />
      ) : (
        <Table>
          <THead>
            <Th>Listing</Th>
            <Th>Category</Th>
            <Th>Price</Th>
            <Th>Views</Th>
            <Th>Status</Th>
            <Th></Th>
          </THead>
          <TBody>
            {filtered.map((l) => (
              <Tr key={l.id} onClick={() => router.push(`/seller/listings/${l.id}`)}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Image src={l.imageUrls[0]} alt="" width={40} height={40} className="rounded-lg object-cover" />
                    <span className="line-clamp-1 max-w-[220px] font-medium text-base-100">{l.title}</span>
                  </div>
                </Td>
                <Td className="text-base-300">{l.category}</Td>
                <Td className="text-base-100 font-medium">{money(l.price)}</Td>
                <Td className="text-base-400">{l.views.toLocaleString()}</Td>
                <Td>
                  <StatusBadge status={l.status} kind="listing" />
                </Td>
                <Td onClick={(e: any) => e.stopPropagation()} className="relative">
                  <button onClick={() => setMenuFor(menuFor === l.id ? null : l.id)} className="text-base-400 hover:text-base-100">
                    <MoreVertical size={16} />
                  </button>
                  {menuFor === l.id && (
                    <div className="absolute right-4 top-10 z-20 w-40 gt-card py-1 shadow-2xl">
                      <button onClick={() => router.push(`/seller/listings/${l.id}`)} className="block w-full px-3 py-2 text-left text-sm hover:bg-base-800">
                        Edit
                      </button>
                      {(l.status === "Active" || l.status === "Paused") && (
                        <button onClick={() => toggleStatus(l.id, l.status)} className="block w-full px-3 py-2 text-left text-sm hover:bg-base-800">
                          {l.status === "Active" ? "Pause listing" : "Activate listing"}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setDeleteTarget(l.id);
                          setMenuFor(null);
                        }}
                        className="block w-full px-3 py-2 text-left text-sm text-accent-rose hover:bg-base-800"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </Td>
              </Tr>
            ))}
          </TBody>
          {filtered.map((l) => (
            <MobileRow key={l.id} onClick={() => router.push(`/seller/listings/${l.id}`)}>
              <div className="flex items-center gap-3">
                <Image src={l.imageUrls[0]} alt="" width={44} height={44} className="rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-medium text-base-100 text-sm">{l.title}</p>
                  <p className="text-xs text-base-400">{l.category}</p>
                </div>
                <StatusBadge status={l.status} kind="listing" />
              </div>
              <MobileRowLine label="Price" value={money(l.price)} />
              <MobileRowLine label="Views" value={l.views.toLocaleString()} />
            </MobileRow>
          ))}
        </Table>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteListing}
        title="Delete this listing?"
        message="This can't be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
