"use client";

import { LayoutDashboard, Users, List, Package, Gavel, CreditCard, ShieldAlert, Settings } from "lucide-react";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { AppShell, NavItem } from "@/components/layout/AppShell";

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Listings", href: "/admin/listings", icon: List },
  { label: "Orders", href: "/admin/orders", icon: Package },
  { label: "Disputes", href: "/admin/disputes", icon: Gavel },
  { label: "Payments", href: "/admin/payments/transactions", icon: CreditCard },
  { label: "Security", href: "/admin/security", icon: ShieldAlert },
  { label: "Settings", href: "/admin/settings/categories", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="admin">
      <AppShell navItems={navItems} homeHref="/admin/dashboard">
        {children}
      </AppShell>
    </RoleGuard>
  );
}
