"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { useApp, useCurrentUser, useListingById } from "@/lib/store";
import { ConversationList } from "@/components/shared/ConversationList";
import { MessageThread } from "@/components/shared/MessageThread";

export default function SellerConversationPage() {
  const params = useParams<{ id: string }>();
  const { state } = useApp();
  const user = useCurrentUser();
  const conversation = state.conversations.find((c) => c.id === params.id);
  const otherId = conversation?.participantIds.find((id) => id !== user?.id);
  const other = state.users.find((u) => u.id === otherId);
  const listing = useListingById(conversation?.relatedListingId);

  if (!conversation || !other) return null;

  return (
    <div className="h-[calc(100vh-160px)] gt-card overflow-hidden">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[320px_1fr]">
        <div className="hidden lg:block border-r border-base-700 p-4 h-full">
          <ConversationList activeId={conversation.id} basePath="/seller/messages" />
        </div>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between border-b border-base-700 pb-3 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <Link href="/seller/messages" className="lg:hidden text-base-400 mr-1" aria-label="Back to messages">
                <ChevronLeft size={20} />
              </Link>
              <Image src={other.avatarUrl} alt={other.name} width={32} height={32} className="rounded-full" />
              <p className="text-sm font-medium text-base-100">{other.name}</p>
            </div>
            {listing && (
              <Link href={`/buyer/listing/${listing.id}`} className="gt-link text-xs font-medium">
                View listing
              </Link>
            )}
          </div>
          <MessageThread conversationId={conversation.id} otherPartyId={other.id} />
        </div>
      </div>
    </div>
  );
}
