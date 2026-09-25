"use client";

import { Home, Package, MessageSquare, Wallet } from "lucide-react";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { AppShell, NavItem } from "@/components/layout/AppShell";

const navItems: NavItem[] = [
  { label: "Home", href: "/buyer", icon: Home },
  { label: "Orders", href: "/buyer/orders", icon: Package },
  { label: "Messages", href: "/buyer/messages", icon: MessageSquare },
  { label: "Wallet", href: "/buyer/wallet", icon: Wallet },
];

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="buyer">
      <AppShell navItems={navItems} homeHref="/buyer" showBuyerHeaderExtras>
        {children}
      </AppShell>
    </RoleGuard>
  );
}
