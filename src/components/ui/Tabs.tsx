"use client";

import clsx from "clsx";

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { label: string; value: T; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-base-700">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={clsx(
            "relative whitespace-nowrap px-3.5 py-2.5 text-sm font-medium transition-colors",
            value === t.value ? "text-base-100" : "text-base-400 hover:text-base-200"
          )}
        >
          {t.label}
          {typeof t.count === "number" && <span className="ml-1.5 text-xs text-base-400">({t.count})</span>}
          {value === t.value && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />}
        </button>
      ))}
    </div>
  );
}
