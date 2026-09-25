import { Check } from "lucide-react";
import clsx from "clsx";
import { Order } from "@/lib/types";

const STEPS = ["Pending", "Delivered", "Completed"] as const;

export function OrderStatusTimeline({ order }: { order: Order }) {
  if (order.status === "Canceled") {
    return (
      <div className="flex items-center gap-3">
        <TimelineDot done label="Placed" />
        <Line />
        <TimelineDot active danger label="Canceled" />
      </div>
    );
  }
  if (order.status === "Disputed") {
    return (
      <div className="flex items-center gap-3">
        <TimelineDot done label="Placed" />
        <Line />
        <TimelineDot active danger label="Disputed" />
      </div>
    );
  }
  const currentIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);
  const labels = ["Placed", "Seller preparing", "Delivered", "Confirmed"];
  // map order.status Pending->step0 done(placed)+step1 active(seller preparing); Delivered-> step2 active; Completed-> step3 active
  const stepIndexMap: Record<string, number> = { Pending: 1, Delivered: 2, Completed: 3 };
  const active = stepIndexMap[order.status] ?? 0;
  return (
    <div className="flex items-center flex-wrap gap-y-2">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center">
          <TimelineDot done={i < active} active={i === active} label={label} />
          {i < labels.length - 1 && <Line done={i < active} />}
        </div>
      ))}
    </div>
  );
}

function TimelineDot({ done, active, danger, label }: { done?: boolean; active?: boolean; danger?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={clsx(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          danger && active && "bg-accent-rose text-white",
          !danger && done && "bg-accent-green text-white",
          !danger && active && !done && "bg-brand-500 text-white",
          !danger && !done && !active && "bg-base-700 text-base-400"
        )}
      >
        {done && !danger ? <Check size={13} /> : ""}
      </div>
      <span className={clsx("text-xs font-medium mr-2", active || done ? "text-base-100" : "text-base-500")}>{label}</span>
    </div>
  );
}

function Line({ done }: { done?: boolean }) {
  return <div className={clsx("h-px w-6 sm:w-10", done ? "bg-accent-green" : "bg-base-700")} />;
}
