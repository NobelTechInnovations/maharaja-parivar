import { cn } from "@/lib/cn";

const tones = {
  verified: "bg-navy-soft text-navy",
  pending: "bg-sandstone/20 text-[#7a5c22]",
  neutral: "bg-panel-soft text-muted border border-line",
};

export function Badge({ tone = "neutral", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
