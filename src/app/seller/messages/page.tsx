"use client";

import { MessageSquare } from "lucide-react";
import { useApp, useCurrentUser } from "@/lib/store";
import { ConversationList } from "@/components/shared/ConversationList";
import { EmptyState } from "@/components/ui/Empty";

export default function SellerMessagesInbox() {
  const { state } = useApp();
  const user = useCurrentUser();
  const hasAny = state.conversations.some((c) => c.participantIds.includes(user?.id ?? "") && !c.supportThread);

  return (
    <div className="h-[calc(100vh-160px)] gt-card overflow-hidden">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[320px_1fr]">
        <div className="border-b lg:border-b-0 lg:border-r border-base-700 p-4 h-full">
          {hasAny ? <ConversationList basePath="/seller/messages" /> : <EmptyState title="No conversations yet" />}
        </div>
        <div className="hidden lg:flex flex-col items-center justify-center gap-2 text-base-400">
          <MessageSquare size={32} />
          <p className="text-sm">Select a conversation to start chatting</p>
        </div>
      </div>
    </div>
  );
}
