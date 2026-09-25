import clsx from "clsx";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("gt-card overflow-hidden", className)}>
      <table className="w-full text-sm hidden md:table">{children}</table>
      <div className="md:hidden divide-y divide-base-700">{children}</div>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="hidden md:table-header-group bg-base-900/70 text-left text-[11px] font-semibold uppercase tracking-wider text-base-400 border-b border-base-700">
      <tr>{children}</tr>
    </thead>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="hidden md:table-row-group divide-y divide-base-700/70">{children}</tbody>;
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={clsx("px-4 py-3.5 font-semibold", className)}>{children}</th>;
}

export function Td({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <td className={clsx("px-4 py-3 align-middle", className)} onClick={onClick}>
      {children}
    </td>
  );
}

export function Tr({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <tr
      onClick={onClick}
      className={clsx("hidden md:table-row transition-colors", onClick && "cursor-pointer hover:bg-base-800/60", className)}
    >
      {children}
    </tr>
  );
}

/** Mobile stacked-card row: pass label/value pairs. Use alongside Tr for desktop. */
export function MobileRow({
  onClick,
  children,
  className,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div onClick={onClick} className={clsx("md:hidden p-4 space-y-2", onClick && "cursor-pointer active:bg-base-800/60", className)}>
      {children}
    </div>
  );
}

export function MobileRowLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-base-400">{label}</span>
      <span className="text-base-100 text-right">{value}</span>
    </div>
  );
}
