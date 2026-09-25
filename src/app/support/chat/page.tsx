"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { MessageCircle } from "lucide-react";
import { useApp, useCurrentUser } from "@/lib/store";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/Empty";
import { relativeTime } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";

type TabKey = "Waiting" | "My active chats" | "Resolved";

export default function LiveChatQueuePage() {
  const { state, dispatch } = useApp();
  const user = useCurrentUser();
  const [tab, setTab] = useState<TabKey>("Waiting");

  const supportConvos = state.conversations.filter((c) => c.supportThread);
  const filtered = supportConvos.filter((c) => {
    if (tab === "Waiting") return !c.claimedBy && !c.resolved;
    if (tab === "My active chats") return c.claimedBy === user?.id && !c.resolved;
    return !!c.resolved;
  });

  function claim(id: string) {
    if (user) dispatch({ type: "CLAIM_CONVERSATION", conversationId: id, agentId: user.id });
  }

  return (
    <div className="h-[calc(100vh-160px)] gt-card overflow-hidden">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[360px_1fr]">
        <div className="border-b lg:border-b-0 lg:border-r border-base-700 p-4 h-full flex flex-col">
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { label: "Waiting", value: "Waiting" },
              { label: "My active chats", value: "My active chats" },
              { label: "Resolved", value: "Resolved" },
            ]}
          />
          <div className="mt-3 flex-1 overflow-y-auto -mx-1">
            {filtered.length === 0 && <p className="px-2 py-6 text-center text-sm text-base-400">No conversations waiting</p>}
            {filtered.map((c) => {
              const otherId = c.participantIds.find((id) => id !== user?.id);
              const other = state.users.find((u) => u.id === otherId);
              const otherRole = other?.roles.find((r) => r === "Buyer" || r === "Seller");
              const lastMsg = state.messages.filter((m) => m.conversationId === c.id).slice(-1)[0];
              return (
                <Link
                  key={c.id}
                  href={`/support/chat/${c.id}`}
                  onClick={() => tab === "Waiting" && claim(c.id)}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 mx-1 hover:bg-base-800/60"
                >
                  {other && <Image src={other.avatarUrl} alt="" width={36} height={36} className="rounded-full" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium text-base-100">{other?.name}</p>
                      {otherRole && <Badge tone="neutral">{otherRole}</Badge>}
                    </div>
                    <p className="truncate text-xs text-base-400">{lastMsg?.text}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-base-400">{relativeTime(c.lastMessageAt)}</span>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="hidden lg:flex flex-col items-center justify-center gap-2 text-base-400">
          <MessageCircle size={32} />
          <p className="text-sm">Select a conversation to start chatting</p>
        </div>
      </div>
    </div>
  );
}
