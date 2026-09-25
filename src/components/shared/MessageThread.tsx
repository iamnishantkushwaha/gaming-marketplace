"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Paperclip, Send } from "lucide-react";
import clsx from "clsx";
import { useApp, useConversationMessages, useCurrentUser, useUserById } from "@/lib/store";
import { Select } from "@/components/ui/Select";
import { genId, nowIso, timeOfDay } from "@/lib/format";

export function MessageThread({
  conversationId,
  otherPartyId,
  cannedResponses,
}: {
  conversationId: string;
  otherPartyId: string;
  cannedResponses?: string[];
}) {
  const { state, dispatch } = useApp();
  const user = useCurrentUser();
  const otherParty = useUserById(otherPartyId);
  const msgs = useConversationMessages(conversationId);
  const [text, setText] = useState(state.composerDrafts[conversationId] ?? "");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [msgs.length]);

  useEffect(() => {
    setText(state.composerDrafts[conversationId] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  function send() {
    if (!text.trim() || !user) return;
    dispatch({
      type: "ADD_MESSAGE",
      message: { id: genId("m"), conversationId, senderId: user.id, text: text.trim(), timestamp: nowIso() },
    });
    dispatch({ type: "SET_COMPOSER_DRAFT", conversationId, text: "" });
    setText("");
  }

  function attach() {
    if (!user) return;
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: genId("m"),
        conversationId,
        senderId: user.id,
        text: "",
        attachment: "screenshot.png",
        timestamp: nowIso(),
      },
    });
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="flex-1 overflow-y-auto space-y-3 px-1 py-2">
        {msgs.map((m) => {
          const mine = m.senderId === user?.id;
          return (
            <div key={m.id} className={clsx("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={clsx(
                  "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                  mine ? "bg-brand-500 text-white rounded-br-sm" : "bg-base-800 text-base-100 rounded-bl-sm"
                )}
              >
                {m.attachment ? (
                  <span className="flex items-center gap-1.5 text-xs italic opacity-90">
                    <Paperclip size={12} /> {m.attachment}
                  </span>
                ) : (
                  m.text
                )}
                <div className={clsx("mt-1 text-[10px]", mine ? "text-white/70" : "text-base-400")}>{timeOfDay(m.timestamp)}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {cannedResponses && (
        <Select
          className="mb-2"
          value=""
          onChange={(v) => {
            if (v) setText(v);
          }}
          placeholder="Insert canned response..."
          options={cannedResponses.map((c) => ({ value: c, label: c }))}
        />
      )}

      <div className="flex items-center gap-2 border-t border-base-700 pt-3">
        <button onClick={attach} className="gt-btn-ghost px-2.5 shrink-0">
          <Paperclip size={17} />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={`Message ${otherParty?.name ?? ""}...`}
          className="gt-input"
        />
        <button onClick={send} disabled={!text.trim()} className="gt-btn-primary px-3 shrink-0">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
