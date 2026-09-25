"use client";

import { useState } from "react";
import { useApp, useCurrentUser } from "@/lib/store";
import { Field } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { ConfirmDialog } from "@/components/ui/Modal";
import { genId } from "@/lib/format";

const SECTIONS = ["Profile", "Payout methods", "Notifications", "Security"] as const;

export default function SellerSettingsPage() {
  const { state, dispatch, toast } = useApp();
  const user = useCurrentUser();
  const [section, setSection] = useState<(typeof SECTIONS)[number]>("Profile");
  const [draft, setDraft] = useState({ name: user?.name ?? "", bio: user?.bio ?? "", country: user?.country ?? "" });
  const [toggles, setToggles] = useState({ orders: true, messages: true, payouts: true, promos: false });
  const [twoFA, setTwoFA] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  if (!user) return null;
  const myMethods = state.paymentMethods.filter((m) => m.userId === user.id);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-6 max-w-3xl">
      <nav className="flex sm:flex-col gap-1 overflow-x-auto">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium ${
              section === s ? "bg-base-800 text-base-100" : "text-base-400 hover:text-base-200"
            }`}
          >
            {s}
          </button>
        ))}
      </nav>

      <div className="gt-card p-5">
        {section === "Profile" && (
          <div className="space-y-4">
            <Field label="Display name">
              <input className="gt-input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <Field label="Bio">
              <textarea className="gt-input" rows={3} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
            </Field>
            <Field label="Country">
              <input className="gt-input" value={draft.country} onChange={(e) => setDraft({ ...draft, country: e.target.value })} />
            </Field>
            <Field label="Avatar">
              <button className="gt-btn-secondary">Upload new photo</button>
            </Field>
            <button
              onClick={() => {
                dispatch({ type: "UPDATE_USER", userId: user.id, patch: draft });
                toast("Changes saved");
              }}
              className="gt-btn-primary"
            >
              Save
            </button>
          </div>
        )}

        {section === "Payout methods" && (
          <div className="space-y-3">
            {myMethods.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border border-base-700 px-4 py-3">
                <span className="text-sm text-base-100">
                  {m.label} {m.masked}
                </span>
                <button onClick={() => setRemoveTarget(m.id)} className="text-xs text-accent-rose font-medium">
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                dispatch({
                  type: "ADD_PAYMENT_METHOD",
                  method: { id: genId("pm"), userId: user.id, label: "Bank account", masked: "•••• 5521", isDefault: false },
                })
              }
              className="gt-btn-secondary"
            >
              Add payout method
            </button>
          </div>
        )}

        {section === "Notifications" && (
          <div className="space-y-3">
            {[
              { key: "orders" as const, label: "New orders" },
              { key: "messages" as const, label: "New messages" },
              { key: "payouts" as const, label: "Payouts" },
              { key: "promos" as const, label: "Promotions" },
            ].map((t) => (
              <div key={t.key} className="flex items-center justify-between">
                <span className="text-sm text-base-200">Email me about: {t.label}</span>
                <Switch
                  checked={toggles[t.key]}
                  onChange={() => setToggles((prev) => ({ ...prev, [t.key]: !prev[t.key] }))}
                  aria-label={`Toggle email notifications for ${t.label}`}
                />
              </div>
            ))}
          </div>
        )}

        {section === "Security" && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-base-200">Two-factor authentication</p>
              {twoFA && <Badge tone="success" className="mt-1">Enabled</Badge>}
            </div>
            <Switch checked={twoFA} onChange={() => setTwoFA((v) => !v)} aria-label="Toggle two-factor authentication" />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (removeTarget) dispatch({ type: "REMOVE_PAYMENT_METHOD", methodId: removeTarget });
          setRemoveTarget(null);
        }}
        title="Remove this payout method?"
        message="You can add it again later."
        confirmLabel="Remove"
      />
    </div>
  );
}
