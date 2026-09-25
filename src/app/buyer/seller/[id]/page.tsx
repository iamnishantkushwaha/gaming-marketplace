"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { useApp, useUserById } from "@/lib/store";
import { StarRating } from "@/components/ui/Stars";
import { ListingCard } from "@/components/shared/ListingCard";
import { shortDate } from "@/lib/format";
import { EmptyState } from "@/components/ui/Empty";

export default function PublicSellerProfilePage() {
  const params = useParams<{ id: string }>();
  const seller = useUserById(params.id);
  const { state } = useApp();

  if (!seller) return <EmptyState title="Seller not found" />;

  const activeListings = state.listings.filter((l) => l.sellerId === seller.id && l.status === "Active");
  const sellerReviews = state.reviews.filter((r) => r.subjectId === seller.id);

  return (
    <div className="max-w-4xl space-y-8">
      <div className="gt-card p-6 flex items-center gap-4 flex-wrap">
        <Image src={seller.avatarUrl} alt={seller.name} width={72} height={72} className="rounded-full" />
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-lg font-semibold text-base-100">{seller.name}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-base-400">
            <StarRating value={seller.rating ?? 0} />
            <span>
              {seller.rating} ({seller.reviewCount} reviews)
            </span>
          </div>
          <p className="mt-1 text-xs text-base-400">Member since {shortDate(seller.joinDate)}</p>
        </div>
        <div className="text-right text-xs text-base-400">
          <p className="flex items-center gap-1.5 justify-end">
            <span className={`h-2 w-2 rounded-full ${seller.online ? "bg-accent-green" : "bg-base-500"}`} />
            {seller.online ? "Online" : "Offline"}
          </p>
          <p className="mt-1">{seller.responseTime}</p>
        </div>
      </div>

      {seller.bio && <p className="text-sm text-base-300">{seller.bio}</p>}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-base-100">Active listings ({activeListings.length})</h2>
        {activeListings.length === 0 ? (
          <EmptyState title="No active listings" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {activeListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-base-100">Reviews ({sellerReviews.length})</h2>
        <div className="gt-card divide-y divide-base-700">
          {sellerReviews.map((r) => (
            <div key={r.id} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <StarRating value={r.rating} size={12} />
                <span className="text-xs text-base-400">{shortDate(r.date)}</span>
              </div>
              <p className="mt-1 text-sm text-base-300">{r.comment}</p>
            </div>
          ))}
          {sellerReviews.length === 0 && <p className="px-4 py-6 text-center text-sm text-base-400">No reviews yet.</p>}
        </div>
      </div>
    </div>
  );
}
