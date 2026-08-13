"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

export function NotificationBell({ initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const poll = () => {
      fetch("/api/notifications/unread-count")
        .then((res) => res.json())
        .then((data) => setCount(data.count ?? 0))
        .catch(() => {});
    };
    const interval = setInterval(poll, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:text-ink"
      aria-label={count > 0 ? `${count} unread notifications` : "Notifications"}
    >
      <Bell size={19} />
      {count > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-maroon px-1 text-[10px] font-semibold leading-none text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
