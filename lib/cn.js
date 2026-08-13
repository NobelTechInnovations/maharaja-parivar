import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Plain tailwind-merge only knows Tailwind's built-in palette, so it can't
// tell that our custom @theme colors (app/globals.css) conflict with each
// other or with built-ins — e.g. "text-white text-navy" was left as both
// classes instead of being deduped, and whichever landed later in the
// generated stylesheet silently won (that's what made the "Join the
// Parivaar" CTA button's text invisible: white-on-white). Registering our
// palette here fixes that for every current and future className override.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      colors: [
        "paper",
        "panel",
        "panel-soft",
        "ink",
        "muted",
        "line",
        "maroon",
        "maroon-dark",
        "maroon-soft",
        "navy",
        "navy-soft",
        "sandstone",
      ],
    },
  },
});

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
