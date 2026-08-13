"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";

function formatWhen(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString([], { day: "numeric", month: "short" });
}

export function ConversationListClient() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => setConversations(data.conversations || []))
      .catch(() => setError("Couldn't reach the server."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="mt-8 text-sm text-muted">Loading…</p>;
  if (error) return <p className="mt-8 text-sm text-maroon">{error}</p>;

  if (conversations.length === 0) {
    return (
      <p className="mt-8 text-sm text-muted">
        No conversations yet — accept a connection request, or send one from the{" "}
        <Link href="/discover" className="text-maroon hover:underline">directory</Link>, to start one.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-2">
      {conversations.map((c) => (
        <Link key={c.id} href={`/messages/${c.id}`}>
          <Card className="flex items-center gap-3 p-4 transition-colors hover:border-maroon/30">
            <Avatar name={c.user?.name} photoUrl={c.user?.photoUrl} size={40} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-ink">{c.user?.name || "Maharajian"}</div>
              <div className="truncate text-xs text-muted">{c.lastMessage || "Say hello 👋"}</div>
            </div>
            <div className="shrink-0 text-xs text-muted">{formatWhen(c.lastMessageAt)}</div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
