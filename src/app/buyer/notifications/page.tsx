"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageSquare, Package, Tag } from "lucide-react";
import { useApp, useCurrentUser } from "@/lib/store";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/Empty";
import { relativeTime } from "@/lib/format";

type FilterKey = "All" | "Orders" | "Messages" | "Promotions";

export default function NotificationsPage() {
  const { state, dispatch } = useApp();
  const user = useCurrentUser();
  const router = useRouter();
  const [tab, setTab] = useState<FilterKey>("All");

  const mine = state.notifications.filter((n) => n.userId === user?.id);
  const map: Record<FilterKey, string | null> = { All: null, Orders: "order", Messages: "message", Promotions: "promo" };
  const filtered = tab === "All" ? mine : mine.filter((n) => n.type === map[tab]);

  function open(id: string, n: (typeof mine)[number]) {
    dispatch({ type: "MARK_NOTIFICATION_READ", id });
    if (n.linkOrderId) router.push(`/buyer/orders/${n.linkOrderId}`);
    else if (n.linkConversationId) router.push(`/buyer/messages/${n.linkConversationId}`);
    else if (n.linkCategory) router.push(`/buyer/search?category=${n.linkCategory}`);
  }

  const icon = { order: Package, message: MessageSquare, promo: Tag };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="gt-page-title">Notifications</h1>
        <button onClick={() => user && dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ", userId: user.id })} className="gt-link text-sm font-medium">
          Mark all as read
        </button>
      </div>
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { label: "All", value: "All" },
          { label: "Orders", value: "Orders" },
          { label: "Messages", value: "Messages" },
          { label: "Promotions", value: "Promotions" },
        ]}
      />
      {filtered.length === 0 ? (
        <EmptyState title="You're all caught up" icon={<Bell size={22} />} />
      ) : (
        <div className="gt-card divide-y divide-base-700">
          {filtered.map((n) => {
            const Icon = icon[n.type];
            return (
              <button
                key={n.id}
                onClick={() => open(n.id, n)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-base-800/60"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-base-800 text-brand-400">
                  <Icon size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-base-100">{n.text}</p>
                  <p className="text-xs text-base-400">{relativeTime(n.timestamp)}</p>
                </div>
                {!n.read && <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
