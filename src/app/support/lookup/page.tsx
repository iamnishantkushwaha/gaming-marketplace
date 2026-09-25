"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import { useApp, useCurrentUser } from "@/lib/store";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { genId, nowIso, shortDate } from "@/lib/format";
import { useRouter } from "next/navigation";

function LookupInner() {
  const params = useSearchParams();
  const { state, dispatch } = useApp();
  const user = useCurrentUser();
  const router = useRouter();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return state.users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q));
  }, [query, state.users]);

  const selected = state.users.find((u) => u.id === selectedId);

  function openChat() {
    if (!selected || !user) return;
    let conv = state.conversations.find((c) => c.supportThread && c.participantIds.includes(selected.id));
    if (!conv) {
      conv = { id: genId("conv"), participantIds: [selected.id, user.id], supportThread: true, lastMessageAt: nowIso() };
      dispatch({ type: "START_CONVERSATION", conversation: conv });
    }
    router.push(`/support/chat/${conv.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="gt-page-title text-center">User Lookup</h1>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedId(null);
          }}
          placeholder="Search for a user by name, email, or ID"
          className="gt-input pl-9"
        />
      </div>

      {!query && <p className="text-center text-sm text-base-400 py-10">Search for a user by name, email, or ID</p>}

      {query && (
        <div className="gt-card divide-y divide-base-700">
          {results.map((u) => (
            <button key={u.id} onClick={() => setSelectedId(u.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-base-800/60">
              <Image src={u.avatarUrl} alt={u.name} width={32} height={32} className="rounded-full" />
              <div>
                <p className="text-sm font-medium text-base-100">{u.name}</p>
                <p className="text-xs text-base-400">{u.email}</p>
              </div>
            </button>
          ))}
          {results.length === 0 && <p className="px-4 py-6 text-center text-sm text-base-400">No users found.</p>}
        </div>
      )}

      {selected && (
        <div className="gt-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Image src={selected.avatarUrl} alt={selected.name} width={48} height={48} className="rounded-full" />
            <div>
              <p className="font-medium text-base-100">{selected.name}</p>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {selected.roles.map((r) => (
                  <Badge key={r} tone="neutral">
                    {r}
                  </Badge>
                ))}
                <StatusBadge status={selected.verificationStatus} kind="verification" />
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-base-400 mb-1.5">Recent orders</p>
            {state.orders.filter((o) => o.buyerId === selected.id || o.sellerId === selected.id).slice(0, 3).map((o) => (
              <p key={o.id} className="text-sm text-base-300">
                {o.id} · {shortDate(o.placedDate)}
              </p>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold text-base-400 mb-1.5">Recent flags</p>
            {state.flags.filter((f) => f.userId === selected.id).length === 0 && <p className="text-sm text-base-400">None</p>}
            {state.flags.filter((f) => f.userId === selected.id).map((f) => (
              <p key={f.id} className="text-sm text-base-300">
                {f.type} — {f.severity}
              </p>
            ))}
          </div>
          <button onClick={openChat} className="gt-btn-primary w-full">
            Open chat with this user
          </button>
        </div>
      )}
    </div>
  );
}

export default function UserLookupPage() {
  return (
    <Suspense fallback={null}>
      <LookupInner />
    </Suspense>
  );
}
