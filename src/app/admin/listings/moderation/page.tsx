"use client";

import { useState } from "react";
import Image from "next/image";
import { useApp, useUserById } from "@/lib/store";
import { EmptyState } from "@/components/ui/Empty";
import { Table, THead, TBody, Tr, Th, Td, MobileRow, MobileRowLine } from "@/components/ui/Table";
import { SideSheet } from "@/components/ui/SideSheet";
import { shortDate } from "@/lib/format";
import { Listing } from "@/lib/types";

export default function ModerationQueuePage() {
  const { state, dispatch, toast } = useApp();
  const [reviewing, setReviewing] = useState<Listing | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const queue = state.listings.filter((l) => l.status === "Pending review");

  function approve(id: string) {
    dispatch({ type: "UPDATE_LISTING", listingId: id, patch: { status: "Active" } });
    toast("Listing approved");
    setReviewing(null);
  }

  function reject(id: string) {
    dispatch({ type: "UPDATE_LISTING", listingId: id, patch: { status: "Rejected", moderationReason: reason } });
    toast("Listing rejected");
    setReviewing(null);
    setRejecting(false);
    setReason("");
  }

  if (queue.length === 0) return <EmptyState title="No listings waiting for review." />;

  return (
    <div className="space-y-5">
      <h1 className="gt-page-title">Moderation Queue</h1>
      <Table>
        <THead>
          <Th>Listing</Th>
          <Th>Seller</Th>
          <Th>Category</Th>
          <Th>Submitted</Th>
          <Th></Th>
        </THead>
        <TBody>
          {queue.map((l) => (
            <ModerationRow key={l.id} listing={l} onReview={() => setReviewing(l)} />
          ))}
        </TBody>
        {queue.map((l) => (
          <MobileRow key={l.id} onClick={() => setReviewing(l)}>
            <div className="flex items-center gap-3">
              <Image src={l.imageUrls[0]} alt="" width={44} height={44} className="rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-base-100 text-sm line-clamp-1">{l.title}</p>
                <p className="text-xs text-base-400">{l.category}</p>
              </div>
            </div>
            <MobileRowLine label="Submitted" value={shortDate(l.createdAt)} />
          </MobileRow>
        ))}
      </Table>

      <SideSheet open={!!reviewing} onClose={() => { setReviewing(null); setRejecting(false); }} title="Review listing">
        {reviewing && (
          <div className="space-y-4">
            <Image src={reviewing.imageUrls[0]} alt="" width={400} height={240} className="w-full rounded-lg object-cover" />
            <h2 className="text-base font-semibold text-base-100">{reviewing.title}</h2>
            <p className="text-sm text-base-300">{reviewing.description}</p>
            <p className="text-lg font-bold text-base-100">${reviewing.price.toFixed(2)}</p>
            <dl className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(reviewing.specs).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-base-400">{k}</dt>
                  <dd className="text-base-200">{v}</dd>
                </div>
              ))}
            </dl>

            {rejecting ? (
              <div className="space-y-2">
                <textarea className="gt-input" rows={3} placeholder="Reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={() => setRejecting(false)} className="gt-btn-secondary flex-1">
                    Cancel
                  </button>
                  <button disabled={!reason.trim()} onClick={() => reject(reviewing.id)} className="gt-btn-destructive flex-1">
                    Confirm reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setRejecting(true)} className="gt-btn-destructive flex-1">
                  Reject
                </button>
                <button onClick={() => approve(reviewing.id)} className="gt-btn-primary flex-1">
                  Approve
                </button>
              </div>
            )}
          </div>
        )}
      </SideSheet>
    </div>
  );
}

function ModerationRow({ listing, onReview }: { listing: Listing; onReview: () => void }) {
  const seller = useUserById(listing.sellerId);
  return (
    <Tr onClick={onReview}>
      <Td>
        <div className="flex items-center gap-3">
          <Image src={listing.imageUrls[0]} alt="" width={40} height={40} className="rounded-lg object-cover" />
          <span className="line-clamp-1 max-w-[220px] font-medium text-base-100">{listing.title}</span>
        </div>
      </Td>
      <Td className="text-base-300">{seller?.name}</Td>
      <Td className="text-base-300">{listing.category}</Td>
      <Td className="text-base-400">{shortDate(listing.createdAt)}</Td>
      <Td onClick={(e: any) => e.stopPropagation()}>
        <button onClick={onReview} className="gt-btn-secondary text-xs px-3 py-1.5">
          Review
        </button>
      </Td>
    </Tr>
  );
}
