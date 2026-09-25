"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Gamepad2, Coins, TrendingUp, Wallet } from "lucide-react";
import { useApp } from "@/lib/store";
import { heroSlides, categoryTiles } from "@/lib/mock-data";
import { ListingCard } from "@/components/shared/ListingCard";

const categoryIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Accounts: Gamepad2,
  Currency: Coins,
  Boosting: TrendingUp,
  "Top-up": Wallet,
  Items: Gamepad2,
};

const categoryNav: { name: string; category?: string }[] = [
  { name: "Accounts", category: "Accounts" },
  { name: "Currency", category: "Currency" },
  { name: "Boosting", category: "Boosting" },
  { name: "Items", category: "Items" },
  { name: "Top-up", category: "Top-up" },
];

export default function MarketplaceHome() {
  const { state } = useApp();
  const [slide, setSlide] = useState(0);
  const activeListings = state.listings.filter((l) => l.status === "Active");
  const recommended = [...activeListings].sort((a, b) => b.wishlistedCount - a.wishlistedCount).slice(0, 4);
  const newest = [...activeListings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  return (
    <div className="space-y-10">
      <nav className="flex items-center gap-2 overflow-x-auto pb-1">
        {categoryNav.map((c) => (
          <Link
            key={c.name}
            href={`/buyer/search?category=${encodeURIComponent(c.category ?? "")}`}
            className="whitespace-nowrap rounded-full border border-base-600 bg-base-900 px-4 py-1.5 text-sm text-base-200 hover:border-brand-500 hover:text-brand-400 transition-colors"
          >
            {c.name}
          </Link>
        ))}
      </nav>

      <section className="relative overflow-hidden rounded-2xl gt-card">
        <div className="relative h-56 sm:h-72">
          <Image src={heroSlides[slide].image} alt={heroSlides[slide].title} fill className="object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-xl sm:text-3xl font-bold text-base-100 max-w-md">{heroSlides[slide].title}</h1>
            <Link
              href={`/buyer/search?category=${encodeURIComponent(heroSlides[slide].category)}`}
              className="gt-btn-primary mt-4 inline-flex"
            >
              Browse now
            </Link>
          </div>
          <button
            onClick={() => setSlide((slide - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setSlide((slide + 1) % heroSlides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all ${i === slide ? "w-6 bg-brand-500" : "w-1.5 bg-base-500"}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-base font-semibold text-base-100">Browse by game</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {categoryTiles.map((tile) => {
            const Icon = categoryIcons[tile.category] ?? Gamepad2;
            return (
              <Link
                key={tile.name}
                href={`/buyer/search?category=${encodeURIComponent(tile.category)}${tile.game ? `&game=${encodeURIComponent(tile.game)}` : ""}`}
                className="gt-card gt-card-hover flex flex-col items-center gap-2 p-4 text-center"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-base-800 text-brand-400">
                  <Icon size={19} />
                </span>
                <span className="text-xs font-medium text-base-200 line-clamp-2">{tile.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <ListingSection title="Recommended for you" listings={recommended} seeAllHref="/buyer/search?sort=recommended" badge="Recommended" />

      <ListingSection title="Newest listings" listings={newest} seeAllHref="/buyer/search?sort=newest" badge="New" />
    </div>
  );
}

function ListingSection({
  title,
  listings,
  seeAllHref,
  badge,
}: {
  title: string;
  listings: ReturnType<typeof Array.prototype.slice>;
  seeAllHref: string;
  badge: "Recommended" | "New";
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-base-100">{title}</h2>
        <Link href={seeAllHref} className="gt-link text-sm font-medium">
          See all
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {listings.map((l: any) => (
          <ListingCard key={l.id} listing={l} badge={badge} />
        ))}
      </div>
    </section>
  );
}
