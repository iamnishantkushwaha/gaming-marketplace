"use client";

import clsx from "clsx";

export function Switch({
  checked,
  onChange,
  size = "md",
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  onChange: () => void;
  size?: "sm" | "md";
  "aria-label"?: string;
}) {
  const track = size === "sm" ? "h-5 w-9" : "h-6 w-10";
  const knob = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const travel = size === "sm" ? "translate-x-4" : "translate-x-4";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={clsx(
        track,
        "relative inline-flex shrink-0 items-center rounded-full border transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-base-950",
        checked ? "bg-brand-500 border-brand-500" : "bg-base-700 border-base-600"
      )}
    >
      <span
        className={clsx(
          knob,
          "pointer-events-none absolute left-0.5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-transform duration-150",
          checked && travel
        )}
      />
    </button>
  );
}
