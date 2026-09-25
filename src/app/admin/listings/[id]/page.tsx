"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShieldAlert, Tag, Calendar } from "lucide-react";
import { useApp, useListingById, useUserById } from "@/lib/store";
import { StatusBadge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/Empty";
import { shortDate } from "@/lib/format";

export default function AdminListingDetailPage() {
  const params = useParams<{ id: string }>();
  const listing = useListingById(params.id);
  const seller = useUserById(listing?.sellerId);
  const { state, dispatch, toast } = useApp();
  const router = useRouter();
  const [removeOpen, setRemoveOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (!listing) return <EmptyState title="Listing not found" />;

  const category = state.categories.find((c) => c.name === listing.category);
  const sellerOrders = state.orders.filter((o) => o.listingId === listing.id);

  function removeListing() {
    dispatch({ type: "UPDATE_LISTING", listingId: listing!.id, patch: { status: "Removed", moderationReason: reason } });
    toast("Listing removed");
    setRemoveOpen(false);
    router.push("/admin/listings");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="gt-page-title">{listing.title}</h1>
          <p className="text-xs text-base-400 mt-1">
            Seller:{" "}
            <Link href={`/admin/users/${seller?.id}`} className="gt-link">
              {seller?.name}
            </Link>
          </p>
        </div>
        <StatusBadge status={listing.status} kind="listing" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Image src={listing.imageUrls[0]} alt="" width={640} height={360} className="w-full rounded-xl object-cover" />

          <div className="gt-card p-5 space-y-3">
            <p className="text-sm text-base-300 leading-relaxed">{listing.description}</p>
            <p className="gt-stat-value">${listing.price.toFixed(2)}</p>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-base-700">
              {Object.entries(listing.specs).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-base-400">{k}</dt>
                  <dd className="mt-0.5 text-base-200">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {listing.moderationReason && (
            <div className="flex items-start gap-2 rounded-lg border border-accent-rose/40 bg-accent-rose/5 px-4 py-3 text-sm text-accent-rose">
              <ShieldAlert size={16} className="mt-0.5 shrink-0" />
              <span>Moderation note: {listing.moderationReason}</span>
            </div>
          )}

          {(listing.status === "Active" || listing.status === "Paused") && (
            <button onClick={() => setRemoveOpen(true)} className="gt-btn-destructive">
              Remove listing
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="gt-card p-5 space-y-3">
            <h2 className="gt-eyebrow">Listing info</h2>
            <div className="flex items-center gap-2 text-sm text-base-300">
              <Tag size={14} className="text-base-500 shrink-0" />
              {listing.category}
              {category && <span className="text-base-500">· {category.commissionRate}% commission</span>}
            </div>
            <div className="flex items-center gap-2 text-sm text-base-300">
              <Calendar size={14} className="text-base-500 shrink-0" />
              Listed {shortDate(listing.createdAt)}
            </div>
          </div>

          {seller && (
            <div className="gt-card p-5 space-y-3">
              <h2 className="gt-eyebrow">Seller</h2>
              <div className="flex items-center gap-3">
                <Image src={seller.avatarUrl} alt={seller.name} width={40} height={40} className="rounded-full" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-base-100 truncate">{seller.name}</p>
                  <p className="text-xs text-base-400 truncate">{seller.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-base-400 pt-2 border-t border-base-700">
                <span>{seller.rating ?? "—"} rating · {seller.reviewCount ?? 0} reviews</span>
                <Link href={`/admin/users/${seller.id}`} className="gt-link font-medium shrink-0">
                  View profile
                </Link>
              </div>
            </div>
          )}

          <div className="gt-card p-5 space-y-2">
            <h2 className="gt-eyebrow">Order history</h2>
            {sellerOrders.length === 0 ? (
              <p className="text-sm text-base-400">No orders yet for this listing.</p>
            ) : (
              <ul className="space-y-2">
                {sellerOrders.slice(0, 5).map((o) => (
                  <li key={o.id}>
                    <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between text-sm gt-link">
                      <span>{o.id}</span>
                      <span className="text-base-400">{shortDate(o.placedDate)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        onConfirm={removeListing}
        title="Remove this listing?"
        message="It will be taken down for violating policy. The seller will be notified."
        confirmLabel="Remove listing"
        requireReason
        reason={reason}
        onReasonChange={setReason}
      />
    </div>
  );
}
