"use client";

import { LayoutDashboard, MessageCircle, Gavel, Search } from "lucide-react";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { AppShell, NavItem } from "@/components/layout/AppShell";

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/support/dashboard", icon: LayoutDashboard },
  { label: "Live Chat", href: "/support/chat", icon: MessageCircle },
  { label: "Disputes", href: "/support/disputes", icon: Gavel },
  { label: "User lookup", href: "/support/lookup", icon: Search },
];

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="support">
      <AppShell navItems={navItems} homeHref="/support/dashboard">
        {children}
      </AppShell>
    </RoleGuard>
  );
}
