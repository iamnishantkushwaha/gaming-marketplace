"use client";

import { LayoutDashboard, List, Package, MessageSquare, Wallet, Star, Settings } from "lucide-react";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { AppShell, NavItem } from "@/components/layout/AppShell";
import Link from "next/link";

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
  { label: "Listings", href: "/seller/listings", icon: List },
  { label: "Orders", href: "/seller/orders", icon: Package },
  { label: "Messages", href: "/seller/messages", icon: MessageSquare },
  { label: "Earnings", href: "/seller/earnings/payouts", icon: Wallet },
  { label: "Reviews", href: "/seller/reviews", icon: Star },
  { label: "Settings", href: "/seller/settings", icon: Settings },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="seller">
      <AppShell navItems={navItems} homeHref="/seller/dashboard">
        <div className="mb-4 flex justify-end">
          <Link href="/seller/listings/new" className="gt-btn-primary">
            + Create listing
          </Link>
        </div>
        {children}
      </AppShell>
    </RoleGuard>
  );
}
