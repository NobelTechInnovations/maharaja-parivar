"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { UserPlus, Handshake, MessageCircle, Heart, MessageSquare, Bell, BadgeCheck } from "lucide-react";

const ICONS = {
  follow: UserPlus,
  connection_request: Handshake,
  connection_accepted: Handshake,
  message: MessageCircle,
  post_like: Heart,
  post_comment: MessageSquare,
  account_verified: BadgeCheck,
};

function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationsClient() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        if (data.unreadCount > 0) {
          fetch("/api/notifications/read", { method: "POST" });
        }
      })
      .catch(() => setError("Couldn't reach the server."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="mt-8 text-sm text-muted">Loading…</p>;
  if (error) return <p className="mt-8 text-sm text-maroon">{error}</p>;

  if (notifications.length === 0) {
    return (
      <p className="mt-8 text-sm text-muted">
        Nothing yet — follows, connection requests, messages and activity on your posts
        will show up here.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-2">
      {notifications.map((n) => {
        const Icon = ICONS[n.type] || Bell;
        return (
          <Link key={n.id} href={n.link}>
            <Card
              className={`flex items-center gap-3 p-4 transition-colors hover:border-maroon/30 ${
                !n.read ? "bg-maroon-soft/40" : ""
              }`}
            >
              {n.actor ? (
                <Avatar name={n.actor.name} photoUrl={n.actor.photoUrl} size={40} />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-panel-soft text-muted">
                  <Icon size={18} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm text-ink">{n.text}</div>
                <div className="text-xs text-muted">{timeAgo(n.createdAt)}</div>
              </div>
              <Icon size={16} className="shrink-0 text-muted" />
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
