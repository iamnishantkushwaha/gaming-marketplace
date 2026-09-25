"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApp, useListingById } from "@/lib/store";
import { StatusBadge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { ConfirmDialog } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/Empty";

export default function SellerListingDetailPage() {
  const params = useParams<{ id: string }>();
  const listing = useListingById(params.id);
  const { state, dispatch, toast } = useApp();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!listing) return <EmptyState title="Listing not found" />;

  const orderCount = state.orders.filter((o) => o.listingId === listing.id).length;
  const conversion = listing.views > 0 ? ((orderCount / listing.views) * 100).toFixed(1) : "0.0";

  function field(key: keyof typeof listing, label: string, type: "text" | "textarea" | "number" = "text") {
    const value = listing![key] as any;
    return (
      <div>
        <p className="mb-1.5 text-xs font-medium text-base-300">{label}</p>
        {type === "textarea" ? (
          <textarea
            className="gt-input"
            rows={4}
            defaultValue={value}
            onBlur={(e) => dispatch({ type: "UPDATE_LISTING", listingId: listing!.id, patch: { [key]: e.target.value } as any })}
          />
        ) : (
          <input
            className="gt-input"
            type={type}
            defaultValue={value}
            onBlur={(e) =>
              dispatch({
                type: "UPDATE_LISTING",
                listingId: listing!.id,
                patch: { [key]: type === "number" ? Number(e.target.value) : e.target.value } as any,
              })
            }
          />
        )}
      </div>
    );
  }

  function save() {
    toast("Changes saved");
  }

  function deleteListing() {
    dispatch({ type: "DELETE_LISTING", listingId: listing.id });
    router.push("/seller/listings");
    toast("Listing deleted");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold text-base-100">{listing.title}</h1>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={listing.status} kind="listing" />
            </div>
          </div>
          <Link href={`/buyer/listing/${listing.id}`} className="gt-link text-sm font-medium">
            View as buyer
          </Link>
        </div>

        {listing.moderationReason && (
          <div className="rounded-lg border border-accent-rose/40 bg-accent-rose/5 px-4 py-3 text-sm text-accent-rose">
            Removed by moderation: {listing.moderationReason}
          </div>
        )}

        <div className="gt-card p-5 space-y-4">
          {field("title", "Title")}
          {field("description", "Description", "textarea")}
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(listing.specs).map((k) => (
              <div key={k}>
                <p className="mb-1.5 text-xs font-medium text-base-300">{k}</p>
                <input
                  className="gt-input"
                  defaultValue={listing.specs[k]}
                  onBlur={(e) =>
                    dispatch({ type: "UPDATE_LISTING", listingId: listing.id, patch: { specs: { ...listing.specs, [k]: e.target.value } } })
                  }
                />
              </div>
            ))}
          </div>
          {field("price", "Price (USD)", "number")}
          <button onClick={save} className="gt-btn-primary">
            Save changes
          </button>
        </div>

        <button onClick={() => setDeleteOpen(true)} className="gt-btn-destructive">
          Delete listing
        </button>
      </div>

      <div className="space-y-4">
        <div className="gt-card p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-base-100">Status</span>
          <Switch
            checked={listing.status === "Active"}
            onChange={() =>
              dispatch({ type: "UPDATE_LISTING", listingId: listing.id, patch: { status: listing.status === "Active" ? "Paused" : "Active" } })
            }
            aria-label="Toggle listing status"
          />
        </div>
        <div className="gt-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-base-100">Performance</h2>
          <StatLine label="Views" value={listing.views.toLocaleString()} />
          <StatLine label="Wishlisted" value={listing.wishlistedCount.toLocaleString()} />
          <StatLine label="Orders from this listing" value={String(orderCount)} />
          <StatLine label="Conversion rate" value={`${conversion}%`} />
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={deleteListing}
        title="Delete this listing?"
        message="This can't be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-base-400">{label}</span>
      <span className="text-base-100 font-medium">{value}</span>
    </div>
  );
}
