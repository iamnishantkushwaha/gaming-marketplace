"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { useApp, useCurrentUser } from "@/lib/store";
import { MessageThread } from "@/components/shared/MessageThread";
import { cannedResponses } from "@/lib/mock-data";

export default function SupportChatWindowPage() {
  const params = useParams<{ id: string }>();
  const { state, dispatch, toast } = useApp();
  const user = useCurrentUser();
  const router = useRouter();
  const conversation = state.conversations.find((c) => c.id === params.id);
  const otherId = conversation?.participantIds.find((id) => id !== user?.id);
  const other = state.users.find((u) => u.id === otherId);
  const otherRole = other?.roles.find((r) => r === "Buyer" || r === "Seller");
  const relatedOrder = state.orders.find((o) => o.id === conversation?.relatedOrderId);

  useEffect(() => {
    if (conversation && !conversation.claimedBy && user) {
      dispatch({ type: "CLAIM_CONVERSATION", conversationId: conversation.id, agentId: user.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id]);

  if (!conversation || !other) return null;

  function markResolved() {
    dispatch({ type: "RESOLVE_CONVERSATION", conversationId: conversation!.id });
    toast("Marked resolved");
    router.push("/support/chat");
  }

  return (
    <div className="h-[calc(100vh-160px)] gt-card overflow-hidden">
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center justify-between border-b border-base-700 pb-3 mb-3 shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Link href="/support/chat" className="text-base-400 mr-1" aria-label="Back to chat list">
              <ChevronLeft size={20} />
            </Link>
            <Image src={other.avatarUrl} alt={other.name} width={32} height={32} className="rounded-full" />
            <div>
              <p className="text-sm font-medium text-base-100">
                {other.name} {otherRole && <span className="text-xs text-base-400">({otherRole})</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/support/lookup?q=${encodeURIComponent(other.name)}`} className="gt-link text-xs font-medium">
              View user
            </Link>
            {relatedOrder && (
              <Link href={`/admin/orders/${relatedOrder.id}`} className="gt-link text-xs font-medium">
                Related order
              </Link>
            )}
            <button onClick={markResolved} className="gt-btn-secondary text-xs px-3 py-1.5">
              Mark as resolved
            </button>
          </div>
        </div>
        <MessageThread conversationId={conversation.id} otherPartyId={other.id} cannedResponses={cannedResponses} />
      </div>
    </div>
  );
}
