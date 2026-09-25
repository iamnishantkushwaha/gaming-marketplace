"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Heart, Info, Minus, Plus } from "lucide-react";
import { useApp, useCurrentUser, useListingById, useUserById, useIsWishlisted } from "@/lib/store";
import { genId, nowIso, relativeTime, shortDate } from "@/lib/format";
import { StarRating } from "@/components/ui/Stars";
import { ListingCard } from "@/components/shared/ListingCard";
import { EmptyState } from "@/components/ui/Empty";

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const listing = useListingById(params.id);
  const { state, dispatch, toast } = useApp();
  const user = useCurrentUser();
  const seller = useUserById(listing?.sellerId);
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showEscrowInfo, setShowEscrowInfo] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const wishlisted = useIsWishlisted(user?.id, listing?.id ?? "");

  const sellerReviews = useMemo(
    () => (listing ? state.reviews.filter((r) => r.subjectId === listing.sellerId) : []),
    [state.reviews, listing]
  );
  const similar = useMemo(
    () =>
      listing
        ? state.listings.filter((l) => l.id !== listing.id && l.category === listing.category && l.status === "Active").slice(0, 4)
        : [],
    [state.listings, listing]
  );

  if (!listing || !seller) {
    return (
      <EmptyState
        title="Listing not found"
        description="This listing may have been removed."
        action={
          <Link href="/buyer" className="gt-btn-primary">
            Back to marketplace
          </Link>
        }
      />
    );
  }

  const isCurrency = listing.category === "Currency";
  const total = isCurrency ? listing.price * quantity : listing.price;

  function toggleWishlist() {
    if (!user) return;
    dispatch({ type: "TOGGLE_WISHLIST", listingId: listing!.id, userId: user.id });
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist");
  }

  function buyNow() {
    dispatch({ type: "SET_CHECKOUT_CONTEXT", listingId: listing!.id, quantity: isCurrency ? quantity : undefined });
    router.push("/buyer/checkout");
  }

  function messageSeller() {
    if (!user) return;
    let conv = state.conversations.find(
      (c) => c.participantIds.includes(user.id) && c.participantIds.includes(seller!.id) && c.relatedListingId === listing!.id
    );
    if (!conv) {
      conv = {
        id: genId("conv"),
        participantIds: [user.id, seller!.id],
        relatedListingId: listing!.id,
        lastMessageAt: nowIso(),
      };
      dispatch({ type: "START_CONVERSATION", conversation: conv });
    }
    dispatch({
      type: "SET_COMPOSER_DRAFT",
      conversationId: conv.id,
      text: `Hi! I'm interested in "${listing!.title}" — is it still available?`,
    });
    router.push(`/buyer/messages/${conv.id}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-1.5 text-sm text-base-400">
        <Link href="/buyer" className="hover:text-base-200">
          Home
        </Link>
        <ChevronRight size={14} />
        <Link href={`/buyer/search?category=${listing.category}`} className="hover:text-base-200">
          {listing.category}
        </Link>
        <ChevronRight size={14} />
        <span className="text-base-200">{listing.game}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="gt-card overflow-hidden">
            <div className="relative aspect-video w-full bg-base-800">
              <Image src={listing.imageUrls[activeImage]} alt={listing.title} fill className="object-cover" />
            </div>
            {listing.imageUrls.length > 1 && (
              <div className="flex gap-2 p-3">
                {listing.imageUrls.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => setActiveImage(i)}
                    className={`relative h-16 w-24 overflow-hidden rounded-lg border-2 ${i === activeImage ? "border-brand-500" : "border-transparent"}`}
                  >
                    <Image src={url} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-base-800 px-2.5 py-0.5 text-xs font-medium text-base-300">{listing.game}</span>
              <span className="rounded-full bg-brand-500/10 border border-brand-500/30 px-2.5 py-0.5 text-xs font-medium text-brand-400">
                {listing.category}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-base-100">{listing.title}</h1>
          </div>

          <div className="gt-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-base-100">Description</h2>
            <p className="text-sm text-base-300 leading-relaxed">{listing.description}</p>
            <h3 className="mt-5 mb-2 text-sm font-semibold text-base-100">Specs</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {Object.entries(listing.specs).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-base-400">{k}</dt>
                  <dd className="text-base-200 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="gt-card p-5">
            <div className="flex items-center gap-3">
              <Image src={seller.avatarUrl} alt={seller.name} width={48} height={48} className="rounded-full" />
              <div className="flex-1 min-w-0">
                <Link href={`/buyer/seller/${seller.id}`} className="font-medium text-base-100 hover:text-brand-400">
                  {seller.name}
                </Link>
                <div className="flex items-center gap-2 text-xs text-base-400 mt-0.5">
                  <StarRating value={seller.rating ?? 0} size={12} />
                  <span>
                    {seller.rating} ({seller.reviewCount} reviews)
                  </span>
                </div>
              </div>
              <div className="text-right text-xs text-base-400 hidden sm:block">
                <p>Member since {shortDate(seller.joinDate)}</p>
                <p>{seller.responseTime}</p>
                <p className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className={`h-2 w-2 rounded-full ${seller.online ? "bg-accent-green" : "bg-base-500"}`} />
                  {seller.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          </div>

          <div className="gt-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-base-100">
                Reviews ({sellerReviews.length})
              </h2>
              {sellerReviews.length > 5 && !showAllReviews && (
                <button onClick={() => setShowAllReviews(true)} className="gt-link text-sm font-medium">
                  See all reviews
                </button>
              )}
            </div>
            <div className="space-y-4">
              {(showAllReviews ? sellerReviews : sellerReviews.slice(0, 5)).map((r) => {
                const author = state.users.find((u) => u.id === r.authorId);
                return (
                  <div key={r.id} className="border-b border-base-700 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-base-200">{author?.name}</span>
                      <span className="text-xs text-base-400">{shortDate(r.date)}</span>
                    </div>
                    <StarRating value={r.rating} size={12} />
                    <p className="mt-1.5 text-sm text-base-300">{r.comment}</p>
                    {r.sellerReply && (
                      <div className="mt-2 rounded-lg bg-base-800/60 px-3 py-2 text-xs text-base-300">
                        <span className="font-medium text-base-200">Seller reply: </span>
                        {r.sellerReply}
                      </div>
                    )}
                  </div>
                );
              })}
              {sellerReviews.length === 0 && <p className="text-sm text-base-400">No reviews yet.</p>}
            </div>
          </div>

          {similar.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-base-100">Similar listings</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {similar.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20 gt-card p-5 space-y-4">
            {isCurrency && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-base-300">Quantity</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="gt-btn-secondary px-2.5">
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="gt-input text-center"
                  />
                  <button onClick={() => setQuantity((q) => q + 1)} className="gt-btn-secondary px-2.5">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-base-400">Total</span>
              <span className="gt-stat-value">${total.toFixed(2)}</span>
            </div>
            <button onClick={buyNow} className="gt-btn-primary w-full py-2.5">
              Buy now
            </button>
            <button onClick={messageSeller} className="gt-btn-secondary w-full py-2.5">
              Message seller
            </button>
            <button onClick={toggleWishlist} className="gt-btn-ghost w-full py-2.5 border border-base-700">
              <Heart size={15} className={wishlisted ? "fill-accent-rose text-accent-rose" : ""} />
              {wishlisted ? "Removed from wishlist" : "Add to wishlist"}
            </button>

            <div className="relative rounded-lg border border-accent-teal/30 bg-accent-teal/5 p-3">
              <div className="flex items-start gap-2">
                <span className="text-xs font-medium text-accent-teal">Payment protected by GameTrade Escrow</span>
                <button onClick={() => setShowEscrowInfo((v) => !v)} className="text-accent-teal shrink-0">
                  <Info size={14} />
                </button>
              </div>
              {showEscrowInfo && (
                <p className="mt-2 text-xs text-base-300 leading-relaxed">
                  We hold your payment until you confirm the order was delivered as described. If something goes
                  wrong, you can open a dispute and our support team will step in to help.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
