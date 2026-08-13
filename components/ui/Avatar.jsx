import { cn } from "@/lib/cn";

function initialsOf(name) {
  return (name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "M";
}

export function Avatar({ name, photoUrl, size = 44, className }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) };

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name || "Profile photo"}
        style={style}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      style={style}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-maroon font-display text-white",
        className
      )}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  );
}
