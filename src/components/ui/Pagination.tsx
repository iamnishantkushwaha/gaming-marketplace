import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (p: number) => void }) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-1 py-6">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="gt-btn-ghost disabled:opacity-30 px-2"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={clsx(
            "h-8 w-8 rounded-lg text-sm font-medium transition-colors",
            p === page ? "bg-brand-500 text-white" : "text-base-300 hover:bg-base-800"
          )}
        >
          {p}
        </button>
      ))}
      <button
        disabled={page === pageCount}
        onClick={() => onChange(page + 1)}
        className="gt-btn-ghost disabled:opacity-30 px-2"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
