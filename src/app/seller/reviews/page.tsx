"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useApp, useCurrentUser } from "@/lib/store";
import { StarRating } from "@/components/ui/Stars";
import { EmptyState } from "@/components/ui/Empty";
import { genId, shortDate } from "@/lib/format";
import clsx from "clsx";

export default function SellerReviewsPage() {
  const { state, dispatch, toast } = useApp();
  const user = useCurrentUser();
  const [starFilter, setStarFilter] = useState<number | "All">("All");
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const myReviews = useMemo(() => state.reviews.filter((r) => r.subjectId === user?.id), [state.reviews, user]);
  const filtered = starFilter === "All" ? myReviews : myReviews.filter((r) => r.rating === starFilter);

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: myReviews.filter((r) => r.rating === star).length,
  }));
  const maxCount = Math.max(1, ...distribution.map((d) => d.count));

  function submitReply(reviewId: string) {
    dispatch({ type: "ADD_SELLER_REPLY", reviewId, reply: replyText });
    setReplyOpen(null);
    setReplyText("");
    toast("Reply posted");
  }

  if (myReviews.length === 0) {
    return <EmptyState title="No reviews yet — reviews will appear here after your first completed sale." />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="gt-card p-6 flex flex-col sm:flex-row gap-6">
        <div className="text-center shrink-0">
          <p className="text-4xl font-bold text-base-100">{user?.rating}</p>
          <StarRating value={user?.rating ?? 0} />
          <p className="mt-1 text-xs text-base-400">{user?.reviewCount} reviews</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {distribution.map((d) => (
            <div key={d.star} className="flex items-center gap-2 text-xs">
              <span className="w-9 flex items-center gap-0.5 text-base-400">
                {d.star} <Star size={11} className="fill-accent-amber text-accent-amber" />
              </span>
              <div className="h-2 flex-1 rounded-full bg-base-800">
                <div className="h-2 rounded-full bg-accent-amber" style={{ width: `${(d.count / maxCount) * 100}%` }} />
              </div>
              <span className="w-6 text-right text-base-400">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {(["All", 5, 4, 3, 2, 1] as const).map((v) => (
          <button
            key={v}
            onClick={() => setStarFilter(v)}
            className={clsx(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium",
              starFilter === v ? "border-brand-500 bg-brand-500/10 text-base-100" : "border-base-600 text-base-300"
            )}
          >
            {v === "All" ? "All" : (
              <>
                {v} <Star size={11} className="fill-current" />
              </>
            )}
          </button>
        ))}
      </div>

      <div className="gt-card divide-y divide-base-700">
        {filtered.map((r) => {
          const author = state.users.find((u) => u.id === r.authorId);
          const listing = state.listings.find((l) => l.id === r.orderId && false) ?? state.listings.find((l) => state.orders.find((o) => o.id === r.orderId)?.listingId === l.id);
          return (
            <div key={r.id} className="px-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-base-100">{author?.name}</span>
                <span className="text-xs text-base-400">{shortDate(r.date)}</span>
              </div>
              <StarRating value={r.rating} size={12} />
              <p className="mt-1.5 text-sm text-base-300">{r.comment}</p>
              {listing && (
                <Link href={`/buyer/listing/${listing.id}`} className="mt-1 inline-block text-xs gt-link">
                  {listing.title}
                </Link>
              )}
              {r.sellerReply ? (
                <div className="mt-2 rounded-lg bg-base-800/60 px-3 py-2 text-xs text-base-300">
                  <span className="font-medium text-base-200">Your reply: </span>
                  {r.sellerReply}
                </div>
              ) : replyOpen === r.id ? (
                <div className="mt-2 space-y-2">
                  <textarea className="gt-input" rows={2} value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                  <button onClick={() => submitReply(r.id)} className="gt-btn-primary text-xs px-3 py-1.5">
                    Post reply
                  </button>
                </div>
              ) : (
                <button onClick={() => setReplyOpen(r.id)} className="mt-2 gt-link text-xs font-medium">
                  Reply
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
