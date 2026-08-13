"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Rss, MessageCircle, User, LogIn, UserPlus } from "lucide-react";
import { cn } from "@/lib/cn";

const MEMBER_TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/discover", label: "Directory", icon: Search },
  { href: "/feed", label: "Feed", icon: Rss },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/me/profile", label: "Profile", icon: User },
];

const GUEST_TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/login", label: "Log in", icon: LogIn },
  { href: "/register", label: "Join", icon: UserPlus },
];

// Fixed bottom navigation for small screens — the app-shell pattern this
// site will eventually run inside on mobile (see the founder's plan to
// wrap the web app in a native shell). Desktop keeps the top Navbar;
// this only renders below the `lg` breakpoint.
export function MobileTabBar({ isVerified }) {
  const pathname = usePathname();
  const tabs = isVerified ? MEMBER_TABS : GUEST_TABS;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className={cn("grid", isVerified ? "grid-cols-5" : "grid-cols-3")}>
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-maroon" : "text-muted"
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
