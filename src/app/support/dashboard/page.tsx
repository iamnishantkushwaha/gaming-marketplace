"use client";

import { useRouter } from "next/navigation";
import { useApp, useCurrentUser } from "@/lib/store";
import { EmptyState } from "@/components/ui/Empty";
import { relativeTime } from "@/lib/format";

export default function SupportDashboard() {
  const { state } = useApp();
  const user = useCurrentUser();
  const router = useRouter();

  const supportConvos = state.conversations.filter((c) => c.supportThread && !c.resolved);
  const waiting = supportConvos.filter((c) => !c.claimedBy);
  const myDisputes = state.disputes.filter((d) => d.status !== "Resolved");
  const resolvedToday = state.conversations.filter((c) => c.resolved).length;

  return (
    <div className="space-y-6">
      <h1 className="gt-page-title">Support Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => router.push("/support/chat")} className="gt-card p-4 text-left hover:border-brand-500/50">
          <p className="text-xs text-base-400">Open chats</p>
          <p className="mt-1.5 gt-stat-value">{supportConvos.length}</p>
        </button>
        <div className="gt-card p-4">
          <p className="text-xs text-base-400">Waiting &gt; 5 min</p>
          <p className="mt-1.5 gt-stat-value">{waiting.length}</p>
        </div>
        <button onClick={() => router.push("/support/disputes")} className="gt-card p-4 text-left hover:border-brand-500/50">
          <p className="text-xs text-base-400">Open disputes assigned to me</p>
          <p className="mt-1.5 gt-stat-value">{myDisputes.length}</p>
        </button>
        <div className="gt-card p-4">
          <p className="text-xs text-base-400">Resolved today</p>
          <p className="mt-1.5 gt-stat-value">{resolvedToday}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-base-100">Chat queue</h2>
        {waiting.length === 0 ? (
          <EmptyState title="No one's waiting — queue is clear" />
        ) : (
          <div className="gt-card divide-y divide-base-700">
            {waiting.slice(0, 5).map((c) => {
              const userId = c.participantIds.find((id) => id !== user?.id);
              const other = state.users.find((u) => u.id === userId);
              const lastMsg = state.messages.filter((m) => m.conversationId === c.id).slice(-1)[0];
              return (
                <button
                  key={c.id}
                  onClick={() => router.push(`/support/chat/${c.id}`)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-base-800/60"
                >
                  <div>
                    <p className="text-base-100 font-medium">{other?.name}</p>
                    <p className="text-xs text-base-400 line-clamp-1">{lastMsg?.text}</p>
                  </div>
                  <span className="text-xs text-base-400">{relativeTime(c.lastMessageAt)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
