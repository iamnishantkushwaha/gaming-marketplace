"use client";

import { Star } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

export function StarRating({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(value) ? "fill-accent-amber text-accent-amber" : "text-base-600"}
        />
      ))}
    </span>
  );
}

export function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}>
          <Star
            size={24}
            className={clsx(
              "transition-colors",
              (hover || value) >= i ? "fill-accent-amber text-accent-amber" : "text-base-600"
            )}
          />
        </button>
      ))}
    </span>
  );
}
