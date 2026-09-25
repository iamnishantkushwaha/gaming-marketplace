"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useApp, useCurrentUser } from "@/lib/store";
import { Category } from "@/lib/types";
import { UploadStub } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { genId, todayDate } from "@/lib/format";

const CATEGORY_GAMES: Record<Category, string[]> = {
  Accounts: ["Valorant", "League of Legends", "Fortnite", "Apex Legends"],
  Currency: ["World of Warcraft", "Final Fantasy XIV", "Path of Exile"],
  Boosting: ["League of Legends", "World of Warcraft", "Valorant"],
  Items: ["Counter-Strike 2", "Rust", "Team Fortress 2"],
  "Top-up": ["Valorant Points", "V-Bucks", "Riot Points"],
};

const STEPS = ["Category", "Details", "Pricing & delivery", "Review"];

export default function CreateListingPage() {
  const { state, dispatch, toast } = useApp();
  const user = useCurrentUser();
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [category, setCategory] = useState<Category | null>(null);
  const [game, setGame] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [images, setImages] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [delivery, setDelivery] = useState<"Instant" | "Manual 1hr" | "Manual 24hr">("Instant");

  const commissionRate = category ? state.categories.find((c) => c.name === category)?.commissionRate ?? 10 : 10;
  const priceNum = Number(price) || 0;
  const youReceive = priceNum - (priceNum * commissionRate) / 100;

  const specFieldsByCategory: Record<Category, string[]> = {
    Accounts: ["Rank", "Region", "Level", "Included skins"],
    Currency: ["Server", "Amount available"],
    Boosting: ["Current rank", "Desired rank", "Estimated completion time"],
    Items: ["Item name", "Condition"],
    "Top-up": ["Platform", "Region"],
  };

  function canNext() {
    if (step === 0) return !!category && !!game;
    if (step === 1) return title.trim() && description.trim();
    if (step === 2) return priceNum > 0;
    return true;
  }

  function publish(status: "Active" | "Draft") {
    if (!user || !category) return;
    dispatch({
      type: "ADD_LISTING",
      listing: {
        id: genId("l"),
        title,
        category,
        game,
        description,
        price: priceNum,
        deliveryMethod: delivery,
        status: status === "Draft" ? "Draft" : "Pending review",
        views: 0,
        wishlistedCount: 0,
        sellerId: user.id,
        imageUrls: images.length ? images.map(() => "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop") : ["https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop"],
        createdAt: todayDate(),
        specs,
      },
    });
    router.push("/seller/listings");
    toast(status === "Draft" ? "Listing saved as draft" : "Listing published");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-center gap-2 text-xs font-medium flex-wrap">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full ${step === i ? "bg-brand-500 text-white" : step > i ? "bg-accent-green text-white" : "bg-base-800 text-base-400"}`}>
              {step > i ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span className={step === i ? "text-base-100" : "text-base-500"}>{label}</span>
            {i < STEPS.length - 1 && <div className="h-px w-6 bg-base-700" />}
          </div>
        ))}
      </div>

      <div className="gt-card p-6 space-y-5">
        {step === 0 && (
          <>
            <h2 className="text-sm font-semibold text-base-100">Choose a category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.keys(CATEGORY_GAMES) as Category[]).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCategory(c);
                    setGame("");
                  }}
                  className={`rounded-lg border px-4 py-4 text-sm font-medium transition-colors ${category === c ? "border-brand-500 bg-brand-500/10 text-base-100" : "border-base-600 text-base-300"}`}
                >
                  {c}
                </button>
              ))}
            </div>
            {category && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-base-300">Game</p>
                <Select
                  value={game}
                  onChange={(v) => setGame(v)}
                  placeholder="Select a game"
                  options={CATEGORY_GAMES[category].map((g) => ({ value: g, label: g }))}
                />
              </div>
            )}
          </>
        )}

        {step === 1 && category && (
          <>
            <h2 className="text-sm font-semibold text-base-100">Listing details</h2>
            <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="gt-input" />
            <textarea placeholder="Description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="gt-input" />
            <div className="grid grid-cols-2 gap-3">
              {specFieldsByCategory[category].map((f) => (
                <div key={f}>
                  <p className="mb-1 text-xs text-base-400">{f}</p>
                  <input
                    className="gt-input"
                    value={specs[f] ?? ""}
                    onChange={(e) => setSpecs({ ...specs, [f]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-base-300">Images (up to 5)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {images.map((img, i) => (
                  <UploadStub key={i} label="" fileName={img} onSelect={() => {}} onRemove={() => setImages(images.filter((_, idx) => idx !== i))} />
                ))}
                {images.length < 5 && (
                  <UploadStub label="Add image" onSelect={(name) => setImages([...images, name])} onRemove={() => {}} />
                )}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-sm font-semibold text-base-100">Pricing & delivery</h2>
            <div>
              <p className="mb-1.5 text-xs font-medium text-base-300">Price (USD)</p>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="gt-input" />
              {priceNum > 0 && (
                <p className="mt-1.5 text-xs text-accent-teal">
                  You&apos;ll receive ${youReceive.toFixed(2)} after {commissionRate}% platform commission
                </p>
              )}
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-base-300">Delivery method</p>
              <Select
                value={delivery}
                onChange={(v) => setDelivery(v as "Instant" | "Manual 1hr" | "Manual 24hr")}
                options={[
                  { value: "Instant", label: "Instant" },
                  { value: "Manual 1hr", label: "Manual within 1 hour" },
                  { value: "Manual 24hr", label: "Manual within 24 hours" },
                ]}
              />
            </div>
          </>
        )}

        {step === 3 && category && (
          <>
            <h2 className="text-sm font-semibold text-base-100">Review your listing</h2>
            <div className="rounded-lg border border-base-700 p-4 space-y-2">
              <p className="text-xs text-base-400">{game}</p>
              <p className="text-base font-semibold text-base-100">{title}</p>
              <p className="text-sm text-base-300">{description}</p>
              <p className="text-lg font-bold text-base-100">${priceNum.toFixed(2)}</p>
              <p className="text-xs text-base-400">Delivery: {delivery}</p>
              <dl className="grid grid-cols-2 gap-2 pt-2 text-xs">
                {Object.entries(specs).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-base-400">{k}</dt>
                    <dd className="text-base-200">{v || "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="gt-btn-secondary disabled:opacity-30">
            Back
          </button>
          <button onClick={() => publish("Draft")} className="gt-link text-sm font-medium">
            Save as draft
          </button>
          {step < 3 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canNext()} className="gt-btn-primary">
              Next
            </button>
          ) : (
            <button onClick={() => publish("Active")} className="gt-btn-primary">
              Publish listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
