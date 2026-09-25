"use client";

import { X } from "lucide-react";

export function SideSheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div className="relative h-full w-full sm:w-[440px] bg-base-900 border-l border-base-700 shadow-elevated flex flex-col animate-fade-in">
        <div className="flex items-center justify-between border-b border-base-700 px-5 py-4 shrink-0">
          <h2 className="text-base font-semibold text-base-100 tracking-tightish">{title}</h2>
          <button onClick={onClose} className="text-base-400 hover:text-base-100 transition-colors rounded-md p-1 hover:bg-base-800">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-base-700 px-5 py-3.5 shrink-0 bg-base-900/60">{footer}</div>}
      </div>
    </div>
  );
}
