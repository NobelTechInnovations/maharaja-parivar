import { cn } from "@/lib/cn";

export function Field({ label, hint, error, children, className }) {
  return (
    <label className={cn("block", className)}>
      {label && <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-maroon">{error}</span>}
    </label>
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70",
        "outline-none transition-colors focus:border-maroon/50 focus:ring-2 focus:ring-maroon/10",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink",
        "outline-none transition-colors focus:border-maroon/50 focus:ring-2 focus:ring-maroon/10",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
