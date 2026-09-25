import { PackageSearch } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-base-700 bg-base-900/40 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-base-800 text-base-400">
        {icon ?? <PackageSearch size={22} />}
      </div>
      <div>
        <p className="text-sm font-medium text-base-100">{title}</p>
        {description && <p className="mt-1.5 text-sm text-base-400 max-w-sm leading-relaxed">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
