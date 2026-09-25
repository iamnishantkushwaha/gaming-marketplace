"use client";

import { useRouter } from "next/navigation";
import { Gamepad2, ShoppingBag, Store, ShieldCheck, Headset, ArrowRight } from "lucide-react";
import { useApp, CURRENT_IDS } from "@/lib/store";
import { Role } from "@/lib/types";

const roleCards: {
  role: Role;
  title: string;
  userId: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
  accent: string;
}[] = [
  {
    role: "buyer",
    title: "Continue as Buyer",
    userId: CURRENT_IDS.buyer,
    description: "Browse listings, buy with escrow protection, and track your orders.",
    icon: ShoppingBag,
    href: "/buyer",
    accent: "from-brand-500/20 to-transparent",
  },
  {
    role: "seller",
    title: "Continue as Seller",
    userId: CURRENT_IDS.seller,
    description: "List items, fulfill orders, get paid out, and build your reputation.",
    icon: Store,
    href: "/seller/dashboard",
    accent: "from-accent-teal/20 to-transparent",
  },
  {
    role: "admin",
    title: "Continue as Admin",
    userId: CURRENT_IDS.admin,
    description: "Moderate the marketplace, resolve disputes, and monitor revenue.",
    icon: ShieldCheck,
    href: "/admin/dashboard",
    accent: "from-accent-amber/20 to-transparent",
  },
  {
    role: "support",
    title: "Continue as Support Agent",
    userId: CURRENT_IDS.support,
    description: "Staff live chat, mediate disputes, and look up account details.",
    icon: Headset,
    href: "/support/dashboard",
    accent: "from-accent-rose/20 to-transparent",
  },
];

export default function RolePickerPage() {
  const { dispatch } = useApp();
  const router = useRouter();

  function pick(role: Role, userId: string, href: string) {
    dispatch({ type: "SET_SESSION", role, userId });
    router.push(href);
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="flex flex-col items-center">
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-base-700 bg-base-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-base-400">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
          Demo build
        </span>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white">
            <Gamepad2 size={24} />
          </div>
          <span className="text-3xl font-bold tracking-tightish text-base-100">GameTrade</span>
        </div>
        <p className="mb-12 max-w-md text-center text-[15px] leading-relaxed text-base-400">
          A marketplace for game accounts, in-game currency, and boosting services — protected by escrow.
          Pick a role below to explore that side of the product.
        </p>

        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
          {roleCards.map((c) => (
            <button
              key={c.role}
              onClick={() => pick(c.role, c.userId, c.href)}
              className="group gt-card gt-card-hover p-6 text-left"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-base-800 text-brand-400 transition-colors duration-150 group-hover:bg-brand-500 group-hover:text-white">
                <c.icon size={20} />
              </div>
              <h2 className="text-base font-semibold text-base-100 flex items-center gap-1.5">
                {c.title}
                <ArrowRight size={15} className="text-base-500 opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0" />
              </h2>
              <p className="mt-1.5 text-sm text-base-400 leading-relaxed">{c.description}</p>
            </button>
          ))}
        </div>

        <p className="mt-10 text-xs text-base-500 max-w-lg text-center leading-relaxed">
          Demo note: in the real product one account can be both a buyer and a seller — this build splits them into
          separate entry points purely so both sides of the marketplace can be clicked through independently.
        </p>
      </div>
    </div>
  );
}
