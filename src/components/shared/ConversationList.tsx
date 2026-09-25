"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { Search, Paperclip } from "lucide-react";
import { useApp, useCurrentUser } from "@/lib/store";
import { relativeTime } from "@/lib/format";

export function ConversationList({
  activeId,
  basePath,
  filterSupport = false,
}: {
  activeId?: string;
  basePath: string;
  filterSupport?: boolean;
}) {
  const { state } = useApp();
  const user = useCurrentUser();
  const [query, setQuery] = useState("");

  const convos = state.conversations
    .filter((c) => c.participantIds.includes(user?.id ?? ""))
    .filter((c) => !!c.supportThread === filterSupport)
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  const filtered = convos.filter((c) => {
    if (!query) return true;
    const otherId = c.participantIds.find((id) => id !== user?.id);
    const other = state.users.find((u) => u.id === otherId);
    return other?.name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="flex h-full flex-col">
      <div className="relative mb-3 shrink-0">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search conversations" className="gt-input pl-9" />
      </div>
      <div className="flex-1 overflow-y-auto -mx-1">
        {filtered.map((c) => {
          const otherId = c.participantIds.find((id) => id !== user?.id)!;
          const other = state.users.find((u) => u.id === otherId);
          const msgs = state.messages.filter((m) => m.conversationId === c.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          const last = msgs[0];
          const unread = last && last.senderId !== user?.id && (!activeId || activeId !== c.id);
          return (
            <Link
              key={c.id}
              href={`${basePath}/${c.id}`}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-2 py-2.5 mx-1 transition-colors",
                activeId === c.id ? "bg-base-800" : "hover:bg-base-800/60"
              )}
            >
              <div className="relative shrink-0">
                {other && <Image src={other.avatarUrl} alt={other.name} width={40} height={40} className="rounded-full" />}
                {other?.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-accent-green border-2 border-base-900" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium text-base-100">{other?.name}</p>
                  {last && <span className="shrink-0 text-[10px] text-base-400">{relativeTime(last.timestamp)}</span>}
                </div>
                <p className="flex items-center gap-1 truncate text-xs text-base-400">
                  {last?.attachment ? (
                    <>
                      <Paperclip size={11} className="shrink-0" /> Attachment
                    </>
                  ) : (
                    last?.text ?? "No messages yet"
                  )}
                </p>
              </div>
              {unread && <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0" />}
            </Link>
          );
        })}
        {filtered.length === 0 && <p className="px-2 py-6 text-center text-sm text-base-400">No conversations yet</p>}
      </div>
    </div>
  );
}
