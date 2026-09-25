"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useApp, useCurrentUser } from "@/lib/store";
import { ConversationList } from "@/components/shared/ConversationList";
import { EmptyState } from "@/components/ui/Empty";

export default function BuyerMessagesInbox() {
  const { state } = useApp();
  const user = useCurrentUser();
  const hasAny = state.conversations.some((c) => c.participantIds.includes(user?.id ?? "") && !c.supportThread);

  return (
    <div className="h-[calc(100vh-160px)] gt-card overflow-hidden">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[320px_1fr]">
        <div className="border-b lg:border-b-0 lg:border-r border-base-700 p-4 h-full">
          <h1 className="mb-3 text-base font-semibold text-base-100 lg:hidden">Messages</h1>
          {hasAny ? (
            <ConversationList basePath="/buyer/messages" />
          ) : (
            <EmptyState
              title="No conversations yet"
              description="Message a seller from a listing to start a conversation."
              action={
                <Link href="/buyer" className="gt-btn-primary">
                  Browse the marketplace
                </Link>
              }
            />
          )}
        </div>
        <div className="hidden lg:flex flex-col items-center justify-center gap-2 text-base-400">
          <MessageSquare size={32} />
          <p className="text-sm">Select a conversation to start chatting</p>
        </div>
      </div>
    </div>
  );
}
