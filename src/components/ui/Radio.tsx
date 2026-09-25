"use client";

import clsx from "clsx";

export function Radio({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label?: React.ReactNode;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 select-none">
      <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          type="radio"
          checked={checked}
          onChange={onChange}
          className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <span
          className={clsx(
            "pointer-events-none flex h-4 w-4 items-center justify-center rounded-full border transition-colors duration-150",
            checked ? "border-brand-500" : "border-base-600 group-hover:border-base-500",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-base-950"
          )}
        >
          {checked && <span className="h-2 w-2 rounded-full bg-brand-500" />}
        </span>
      </span>
      {label !== undefined && <span className="text-sm text-base-200">{label}</span>}
    </label>
  );
}
