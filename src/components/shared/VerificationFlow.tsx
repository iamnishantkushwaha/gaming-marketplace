"use client";

import { useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useApp, useCurrentUser } from "@/lib/store";
import { UploadStub } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";

export function VerificationFlow({ frame }: { frame: "buyer" | "seller" }) {
  const { dispatch, toast } = useApp();
  const user = useCurrentUser();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [docType, setDocType] = useState("Passport");
  const [front, setFront] = useState<string | undefined>();
  const [back, setBack] = useState<string | undefined>();
  const [selfie, setSelfie] = useState<string | undefined>();

  if (!user) return null;
  const status = user.verificationStatus;

  function submit() {
    dispatch({ type: "SET_VERIFICATION", userId: user!.id, status: "Pending" });
    toast("Verification submitted");
  }

  const messages: Record<string, string> = {
    Unverified:
      frame === "seller" ? "Verify your identity to start selling" : "Verify your identity to unlock higher purchase limits",
    Pending: "Your documents are under review",
    Verified: "You're verified",
    Rejected: "Your verification was rejected — please resubmit your documents",
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="mb-2 flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
        {["Identity document", "Selfie", status === "Verified" ? "Verified" : "Under review"].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                step === i || (i === 2 && status !== "Unverified") ? "bg-brand-500 text-white" : "bg-base-800 text-base-400"
              }`}
            >
              {i + 1}
            </div>
            <span className="text-base-400">{label}</span>
            {i < 2 && <div className="h-px w-6 bg-base-700" />}
          </div>
        ))}
      </div>

      <div className="gt-card p-6 space-y-4">
        <div
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
            status === "Verified"
              ? "border-accent-green/40 bg-accent-green/5 text-accent-green"
              : status === "Pending"
              ? "border-accent-amber/40 bg-accent-amber/5 text-accent-amber"
              : status === "Rejected"
              ? "border-accent-rose/40 bg-accent-rose/5 text-accent-rose"
              : "border-base-600 bg-base-900 text-base-300"
          }`}
        >
          {status === "Verified" ? <CheckCircle2 size={18} /> : <ShieldCheck size={18} />}
          {messages[status]}
        </div>

        {status === "Unverified" && step === 0 && (
          <button onClick={() => setStep(1)} className="gt-btn-primary w-full">
            Start verification
          </button>
        )}

        {status === "Unverified" && step === 1 && (
          <div className="space-y-3">
            <p className="mb-1.5 text-xs font-medium text-base-300">Document type</p>
            <Select
              value={docType}
              onChange={(v) => setDocType(v)}
              options={[
                { value: "Passport", label: "Passport" },
                { value: "Driver's license", label: "Driver's license" },
                { value: "National ID", label: "National ID" },
              ]}
            />
            <UploadStub label="Upload front" fileName={front} onSelect={setFront} onRemove={() => setFront(undefined)} />
            <UploadStub label="Upload back" fileName={back} onSelect={setBack} onRemove={() => setBack(undefined)} />
            <button disabled={!front || !back} onClick={() => setStep(2)} className="gt-btn-primary w-full">
              Next
            </button>
          </div>
        )}

        {status === "Unverified" && step === 2 && (
          <div className="space-y-3">
            <UploadStub label="Upload selfie" fileName={selfie} onSelect={setSelfie} onRemove={() => setSelfie(undefined)} />
            <button disabled={!selfie} onClick={submit} className="gt-btn-primary w-full">
              Submit for review
            </button>
          </div>
        )}

        {status === "Pending" && (
          <p className="text-sm text-base-400">Documents submitted — review usually takes 24-48 hours.</p>
        )}

        {status === "Rejected" && (
          <button
            onClick={() => {
              dispatch({ type: "SET_VERIFICATION", userId: user.id, status: "Unverified" });
              setStep(0);
            }}
            className="gt-btn-primary w-full"
          >
            Resubmit documents
          </button>
        )}

        {status === "Verified" && (
          <div className="flex justify-center">
            <StatusBadge status="Verified" kind="verification" />
          </div>
        )}
      </div>
    </div>
  );
}
