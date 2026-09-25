"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import clsx from "clsx";
import { Listing } from "@/lib/types";
import { useUserById, useApp, useCurrentUser, useIsWishlisted } from "@/lib/store";
import { Badge } from "@/components/ui/Badge";

export function ListingCard({
  listing,
  badge,
  showWishlist = true,
  basePath = "/buyer/listing",
}: {
  listing: Listing;
  badge?: "Recommended" | "New";
  showWishlist?: boolean;
  basePath?: string;
}) {
  const seller = useUserById(listing.sellerId);
  const banned = seller?.accountStatus === "Banned";
  const { dispatch, toast } = useApp();
  const user = useCurrentUser();
  const wishlisted = useIsWishlisted(user?.id, listing.id);

  function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) return;
    dispatch({ type: "TOGGLE_WISHLIST", listingId: listing.id, userId: user.id });
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist");
  }

  return (
    <Link
      href={`${basePath}/${listing.id}`}
      className={clsx(
        "group gt-card gt-card-hover overflow-hidden flex flex-col",
        banned && "opacity-50 grayscale pointer-events-none"
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-base-800">
        <Image src={listing.imageUrls[0]} alt={listing.title} fill sizes="300px" className="object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        {badge && (
          <span className="absolute left-2 top-2">
            <Badge tone={badge === "Recommended" ? "brand" : "info"}>{badge}</Badge>
          </span>
        )}
        {showWishlist && (
          <button
            onClick={toggleWishlist}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur transition-colors hover:bg-black/70"
          >
            <Heart size={15} className={wishlisted ? "fill-accent-rose text-accent-rose" : "text-white"} />
          </button>
        )}
        {banned && (
          <span className="absolute inset-x-0 bottom-0 bg-black/70 py-1 text-center text-xs text-accent-rose">Seller unavailable</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <span className="text-xs font-medium text-base-400">{listing.game}</span>
        <h3 className="line-clamp-2 text-sm font-medium text-base-100 leading-snug group-hover:text-brand-300 transition-colors">
          {listing.title}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-base-800/80 mt-2">
          <div className="flex items-center gap-1 text-xs text-base-400 min-w-0">
            <span className="truncate max-w-[80px]">{seller?.name}</span>
            {seller?.rating && (
              <span className="flex items-center gap-0.5 shrink-0">
                <Star size={11} className="fill-accent-amber text-accent-amber" />
                {seller.rating}
              </span>
            )}
          </div>
          <span className="text-sm font-bold text-base-100 shrink-0">${listing.price.toFixed(2)}</span>
        </div>
      </div>
    </Link>
  );
}
