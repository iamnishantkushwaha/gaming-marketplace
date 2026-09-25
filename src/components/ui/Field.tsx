export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-base-300">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-base-400">{hint}</span>}
    </label>
  );
}

export function UploadStub({
  label,
  fileName,
  onSelect,
  onRemove,
}: {
  label: string;
  fileName?: string;
  onSelect: (name: string) => void;
  onRemove: () => void;
}) {
  if (fileName) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-base-600 bg-base-900 px-3 py-2 text-sm">
        <span className="truncate text-base-200">{fileName}</span>
        <button onClick={onRemove} className="text-base-400 hover:text-accent-rose text-xs font-medium">
          Remove
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onSelect(`${label.replace(/\s+/g, "_").toLowerCase()}_${Math.floor(Math.random() * 9000 + 1000)}.jpg`)}
      className="flex w-full items-center justify-center rounded-lg border border-dashed border-base-600 bg-base-900/60 px-3 py-6 text-sm text-base-400 hover:border-brand-500 hover:text-brand-400 transition-colors"
    >
      {label}
    </button>
  );
}
