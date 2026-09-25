"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import { Bell, Menu, Search, Wallet, X, ChevronDown, Gamepad2 } from "lucide-react";
import { useApp, useCurrentUser, useUnreadNotificationCount, useBalance } from "@/lib/store";
import { relativeTime } from "@/lib/format";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export function AppShell({
  navItems,
  homeHref,
  children,
  showBuyerHeaderExtras = false,
}: {
  navItems: NavItem[];
  homeHref: string;
  children: React.ReactNode;
  showBuyerHeaderExtras?: boolean;
}) {
  const { state, dispatch } = useApp();
  const user = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState("");
  const unread = useUnreadNotificationCount(user?.id);
  const balance = useBalance(user?.id);
  const recentNotifs = state.notifications.filter((n) => n.userId === user?.id).slice(0, 5);

  function switchRole() {
    dispatch({ type: "LOG_OUT" });
    router.push("/");
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/buyer/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-base-700/80 bg-base-950/80 backdrop-blur-md shadow-header">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button className="lg:hidden text-base-300 hover:text-base-100 transition-colors" onClick={() => setDrawerOpen(true)}>
            <Menu size={22} />
          </button>
          <Link href={homeHref} className="flex items-center gap-2 shrink-0 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
              <Gamepad2 size={17} />
            </div>
            <span className="hidden sm:block text-lg font-bold tracking-tightish text-base-100">GameTrade</span>
          </Link>

          {showBuyerHeaderExtras && (
            <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search accounts, currency, boosting..."
                  className="gt-input pl-9"
                />
              </div>
            </form>
          )}

          <nav className="hidden lg:flex items-center gap-0.5 ml-2">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-base-800 text-base-100 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]"
                      : "text-base-400 hover:text-base-100 hover:bg-base-800/50"
                  )}
                >
                  <item.icon size={15} className={active ? "text-brand-400" : ""} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" />

          {showBuyerHeaderExtras && (
            <Link
              href="/buyer/wallet"
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-base-600 bg-base-900 px-3 py-1.5 text-sm font-medium text-base-100 transition-all duration-150 hover:border-accent-teal/60 hover:bg-base-800"
            >
              <Wallet size={14} className="text-accent-teal" />
              ${balance.toFixed(2)}
            </Link>
          )}

          {showBuyerHeaderExtras && (
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setAvatarOpen(false);
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-base-800 text-base-300"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-rose text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 gt-card shadow-elevated animate-fade-in overflow-hidden">
                  <div className="border-b border-base-700 px-4 py-3 text-sm font-semibold text-base-100">Notifications</div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-base-700/70">
                    {recentNotifs.length === 0 && <p className="px-4 py-6 text-center text-sm text-base-400">No notifications yet.</p>}
                    {recentNotifs.map((n) => (
                      <div key={n.id} className={clsx("px-4 py-3 text-sm transition-colors hover:bg-base-800/50", !n.read && "bg-brand-500/[0.06]")}>
                        <p className="text-base-200">{n.text}</p>
                        <p className="mt-1 text-xs text-base-400">{relativeTime(n.timestamp)}</p>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/buyer/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="block border-t border-base-700 px-4 py-2.5 text-center text-sm font-medium gt-link"
                  >
                    View all
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => {
                setAvatarOpen((v) => !v);
                setNotifOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-full hover:bg-base-800 p-1 pr-2 transition-colors"
            >
              {user && (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={30}
                  height={30}
                  className="rounded-full ring-2 ring-base-700"
                />
              )}
              <ChevronDown size={14} className={clsx("hidden sm:block text-base-400 transition-transform", avatarOpen && "rotate-180")} />
            </button>
            {avatarOpen && (
              <div className="absolute right-0 mt-2 w-56 gt-card shadow-elevated animate-fade-in overflow-hidden py-1.5">
                <div className="px-3 py-2.5 border-b border-base-700 flex items-center gap-2.5">
                  {user && <Image src={user.avatarUrl} alt={user.name} width={32} height={32} className="rounded-full" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-base-100 truncate">{user?.name}</p>
                    <p className="text-xs text-base-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="py-1">
                  {showBuyerHeaderExtras ? (
                    <>
                      <MenuLink href="/buyer/profile" label="My Profile" onClick={() => setAvatarOpen(false)} />
                      <MenuLink href="/buyer/profile/verification" label="Verification" onClick={() => setAvatarOpen(false)} />
                    </>
                  ) : (
                    <MenuLink href={homeHref} label="Dashboard" onClick={() => setAvatarOpen(false)} />
                  )}
                </div>
                <div className="border-t border-base-700 py-1">
                  <button onClick={switchRole} className="block w-full text-left px-3 py-2 text-sm text-base-300 hover:bg-base-800 transition-colors">
                    Switch role
                  </button>
                  <button onClick={switchRole} className="block w-full text-left px-3 py-2 text-sm text-accent-rose hover:bg-base-800 transition-colors">
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-base-900 border-r border-base-700 p-4 shadow-elevated animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-white">
                  <Gamepad2 size={15} />
                </div>
                <span className="text-lg font-bold text-base-100">GameTrade</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="text-base-400 hover:text-base-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            {showBuyerHeaderExtras && (
              <form onSubmit={submitSearch} className="mb-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="gt-input pl-9" />
                </div>
              </form>
            )}
            <nav className="flex flex-col gap-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className={clsx(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname.startsWith(item.href) ? "bg-base-800 text-base-100" : "text-base-400 hover:bg-base-800/50 hover:text-base-200"
                  )}
                >
                  <item.icon size={16} className={pathname.startsWith(item.href) ? "text-brand-400" : ""} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>

      <footer className="border-t border-base-800 py-8 text-center text-xs text-base-500">
        GameTrade demo build — mock data only, no real payments or authentication.
      </footer>
    </div>
  );
}

function MenuLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block px-3 py-2 text-sm text-base-300 hover:bg-base-800 transition-colors">
      {label}
    </Link>
  );
}
