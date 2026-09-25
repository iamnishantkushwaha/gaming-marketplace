"use client";

import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useApp } from "@/lib/store";

export function ToastHost() {
  const { state, dispatch } = useApp();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
      {state.toasts.map((t) => (
        <ToastItem key={t.id} id={t.id} message={t.message} onDismiss={() => dispatch({ type: "DISMISS_TOAST", id: t.id })} />
      ))}
    </div>
  );
}

function ToastItem({ id, message, onDismiss }: { id: string; message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="animate-fade-in flex items-start gap-2 rounded-lg border border-base-600 bg-base-850 shadow-elevated px-4 py-3 text-sm text-base-100">
      <CheckCircle2 size={18} className="text-accent-green mt-0.5 shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="text-base-400 hover:text-base-100 shrink-0">
        <X size={16} />
      </button>
    </div>
  );
}
