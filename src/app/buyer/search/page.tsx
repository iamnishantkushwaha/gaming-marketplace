"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useApp } from "@/lib/store";
import { Category, Listing } from "@/lib/types";
import { ListingCard } from "@/components/shared/ListingCard";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/Empty";
import { Checkbox } from "@/components/ui/Checkbox";
import { Radio } from "@/components/ui/Radio";
import { Select } from "@/components/ui/Select";

const ALL_CATEGORIES: Category[] = ["Accounts", "Currency", "Boosting", "Items", "Top-up"];
const ALL_GAMES = [
  "Valorant",
  "League of Legends",
  "World of Warcraft",
  "Fortnite",
  "Final Fantasy XIV",
  "Apex Legends",
];
const PAGE_SIZE = 8;

type SortKey = "recommended" | "price-asc" | "price-desc" | "newest" | "rated";

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { state } = useApp();

  const [categories, setCategories] = useState<Category[]>(() => {
    const c = params.get("category");
    return c && ALL_CATEGORIES.includes(c as Category) ? [c as Category] : [];
  });
  const [game, setGame] = useState<string>(params.get("game") ?? "");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(200);
  const [minRating, setMinRating] = useState<"any" | "4" | "4.5">("any");
  const [delivery, setDelivery] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>((params.get("sort") as SortKey) ?? "recommended");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const q = params.get("q") ?? "";

  function toggleCategory(c: Category) {
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
    setPage(1);
  }
  function toggleDelivery(d: string) {
    setDelivery((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
    setPage(1);
  }
  function clearFilters() {
    setCategories([]);
    setGame("");
    setPriceMin(0);
    setPriceMax(200);
    setMinRating("any");
    setDelivery([]);
    setPage(1);
  }

  const deliveryMap: Record<string, string> = {
    Instant: "Instant",
    "Under 1 hour": "Manual 1hr",
    "Under 24 hours": "Manual 24hr",
  };

  const filtered = useMemo(() => {
    let results = state.listings.filter((l) => l.status === "Active");
    if (q) {
      const ql = q.toLowerCase();
      results = results.filter((l) => l.title.toLowerCase().includes(ql) || l.game.toLowerCase().includes(ql));
    }
    if (categories.length) results = results.filter((l) => categories.includes(l.category));
    if (game) results = results.filter((l) => l.game === game);
    results = results.filter((l) => l.price >= priceMin && l.price <= priceMax);
    if (minRating !== "any") {
      const threshold = minRating === "4" ? 4 : 4.5;
      results = results.filter((l) => {
        const seller = state.users.find((u) => u.id === l.sellerId);
        return (seller?.rating ?? 0) >= threshold;
      });
    }
    if (delivery.length) {
      const allowed = delivery.map((d) => deliveryMap[d]);
      results = results.filter((l) => allowed.includes(l.deliveryMethod));
    }

    const sorted = [...results];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "newest") sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sort === "rated")
      sorted.sort((a, b) => {
        const ra = state.users.find((u) => u.id === a.sellerId)?.rating ?? 0;
        const rb = state.users.find((u) => u.id === b.sellerId)?.rating ?? 0;
        return rb - ra;
      });
    else sorted.sort((a, b) => b.wishlistedCount - a.wishlistedCount);
    return sorted;
  }, [state.listings, state.users, q, categories, game, priceMin, priceMax, minRating, delivery, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const filterBody = (
    <div className="space-y-6">
      <div>
        <p className="mb-2 gt-eyebrow">Category</p>
        <div className="space-y-2">
          {ALL_CATEGORIES.map((c) => (
            <Checkbox key={c} checked={categories.includes(c)} onChange={() => toggleCategory(c)} label={c} />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 gt-eyebrow">Game</p>
        <Select
          value={game}
          onChange={(v) => { setGame(v); setPage(1); }}
          placeholder="All games"
          options={[{ value: "", label: "All games" }, ...ALL_GAMES.map((g) => ({ value: g, label: g }))]}
        />
      </div>
      <div>
        <p className="mb-2 gt-eyebrow">Price range</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={priceMin}
            onChange={(e) => { setPriceMin(Number(e.target.value)); setPage(1); }}
            className="gt-input"
            min={0}
          />
          <span className="text-base-400">–</span>
          <input
            type="number"
            value={priceMax}
            onChange={(e) => { setPriceMax(Number(e.target.value)); setPage(1); }}
            className="gt-input"
            min={0}
          />
        </div>
        <input
          type="range"
          min={0}
          max={200}
          value={priceMax}
          onChange={(e) => { setPriceMax(Number(e.target.value)); setPage(1); }}
          className="mt-2 w-full accent-brand-500"
        />
      </div>
      <div>
        <p className="mb-2 gt-eyebrow">Seller rating</p>
        <div className="space-y-2">
          {(["any", "4", "4.5"] as const).map((v) => (
            <Radio
              key={v}
              checked={minRating === v}
              onChange={() => { setMinRating(v); setPage(1); }}
              label={v === "any" ? "Any" : `${v}+ stars`}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 gt-eyebrow">Delivery speed</p>
        <div className="space-y-2">
          {Object.keys(deliveryMap).map((d) => (
            <Checkbox key={d} checked={delivery.includes(d)} onChange={() => toggleDelivery(d)} label={d} />
          ))}
        </div>
      </div>
      <button onClick={clearFilters} className="text-sm gt-link font-medium">
        Clear all filters
      </button>
    </div>
  );

  return (
    <div className="flex gap-8">
      <aside className="hidden lg:block w-64 shrink-0">
        <h2 className="mb-4 text-sm font-semibold text-base-100">Filters</h2>
        {filterBody}
      </aside>

      <div className="flex-1 min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setFiltersOpen(true)} className="gt-btn-secondary lg:hidden">
              <SlidersHorizontal size={14} /> Filters
            </button>
            <p className="text-sm text-base-400">
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
              {q && <> for &ldquo;{q}&rdquo;</>}
            </p>
          </div>
          <Select
            className="w-52"
            value={sort}
            onChange={(v) => { setSort(v as SortKey); setPage(1); }}
            options={[
              { value: "recommended", label: "Recommended" },
              { value: "price-asc", label: "Price: low to high" },
              { value: "price-desc", label: "Price: high to low" },
              { value: "newest", label: "Newest" },
              { value: "rated", label: "Best rated" },
            ]}
          />
        </div>

        {pageItems.length === 0 ? (
          <EmptyState
            title="No listings match your filters"
            description="Try widening your price range or clearing a filter."
            action={
              <button onClick={clearFilters} className="gt-btn-primary">
                Clear filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {pageItems.map((l: Listing) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
        <Pagination page={page} pageCount={pageCount} onChange={setPage} />
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-base-900 border-t border-base-700 p-5 animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-base-100">Filters</h2>
              <button onClick={() => setFiltersOpen(false)} className="text-base-400">
                <X size={20} />
              </button>
            </div>
            {filterBody}
            <button onClick={() => setFiltersOpen(false)} className="gt-btn-primary w-full mt-5">
              Show {filtered.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  );
}
