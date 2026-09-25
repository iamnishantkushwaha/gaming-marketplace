"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  widthClass = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClass?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${widthClass} gt-card animate-fade-in shadow-elevated`}>
        <div className="flex items-center justify-between border-b border-base-700 px-5 py-4">
          <h2 className="text-base font-semibold text-base-100 tracking-tightish">{title}</h2>
          <button onClick={onClose} className="text-base-400 hover:text-base-100 transition-colors rounded-md p-1 hover:bg-base-800">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-base-700 px-5 py-3.5 bg-base-900/40 rounded-b-xl">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  destructive = true,
  requireReason = false,
  reason,
  onReasonChange,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  requireReason?: boolean;
  reason?: string;
  onReasonChange?: (v: string) => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="gt-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className={destructive ? "gt-btn-destructive" : "gt-btn-primary"}
            disabled={requireReason && !reason?.trim()}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-base-300">{message}</p>
      {requireReason && (
        <textarea
          className="gt-input mt-3"
          rows={3}
          placeholder="Reason (required)"
          value={reason ?? ""}
          onChange={(e) => onReasonChange?.(e.target.value)}
        />
      )}
    </Modal>
  );
}
