import clsx from "clsx";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "brand";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-base-700/70 text-base-200 border-base-600",
  success: "bg-accent-green/10 text-accent-green border-accent-green/25",
  warning: "bg-accent-amber/10 text-accent-amber border-accent-amber/25",
  danger: "bg-accent-rose/10 text-accent-rose border-accent-rose/25",
  info: "bg-accent-blue/10 text-accent-blue border-accent-blue/25",
  brand: "bg-brand-500/10 text-brand-300 border-brand-500/25",
};

const dotClasses: Record<Tone, string> = {
  neutral: "bg-base-400",
  success: "bg-accent-green",
  warning: "bg-accent-amber",
  danger: "bg-accent-rose",
  info: "bg-accent-blue",
  brand: "bg-brand-400",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  dot = false,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
        className
      )}
    >
      {dot && <span className={clsx("h-1.5 w-1.5 rounded-full", dotClasses[tone])} />}
      {children}
    </span>
  );
}

const orderStatusTone: Record<string, Tone> = {
  Pending: "warning",
  Delivered: "info",
  Completed: "success",
  Disputed: "danger",
  Canceled: "neutral",
};

const listingStatusTone: Record<string, Tone> = {
  Draft: "neutral",
  "Pending review": "warning",
  Active: "success",
  Paused: "neutral",
  Rejected: "danger",
  Removed: "danger",
  "Sold out": "info",
};

const verificationTone: Record<string, Tone> = {
  Unverified: "neutral",
  Pending: "warning",
  Verified: "success",
  Rejected: "danger",
};

const disputeTone: Record<string, Tone> = {
  Open: "danger",
  "Under review": "warning",
  Resolved: "success",
};

export function StatusBadge({ status, kind }: { status: string; kind: "order" | "listing" | "verification" | "dispute" | "flag" | "account" | "transaction" }) {
  let tone: Tone = "neutral";
  if (kind === "order") tone = orderStatusTone[status] ?? "neutral";
  if (kind === "listing") tone = listingStatusTone[status] ?? "neutral";
  if (kind === "verification") tone = verificationTone[status] ?? "neutral";
  if (kind === "dispute") tone = disputeTone[status] ?? "neutral";
  if (kind === "flag") tone = status === "New" ? "danger" : status === "Reviewed" ? "info" : "neutral";
  if (kind === "account") tone = status === "Banned" ? "danger" : "success";
  if (kind === "transaction") tone = status === "Completed" ? "success" : status === "Processing" ? "warning" : "danger";
  return (
    <Badge tone={tone} dot>
      {status}
    </Badge>
  );
}
