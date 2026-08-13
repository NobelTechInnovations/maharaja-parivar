import { cn } from "@/lib/cn";

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-panel shadow-[0_1px_2px_rgba(40,30,10,0.05),0_6px_16px_rgba(40,30,10,0.06)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
