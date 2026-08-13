import Link from "next/link";
import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-maroon text-white hover:bg-maroon-dark",
  secondary: "bg-white text-ink border border-line hover:border-maroon/40 hover:text-maroon",
  ghost: "text-ink hover:text-maroon",
  // For a primary-weight button sitting on a dark background (the navy CTA
  // card, the hero) — a real variant instead of overriding primary's
  // classes by className, since that override is exactly what silently
  // broke before (see the cn() comment in lib/cn.js).
  invert: "bg-white text-navy hover:bg-white/90",
};

const sizes = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-[15px]",
};

export function Button({
  as,
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  const Component = as || "button";
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
