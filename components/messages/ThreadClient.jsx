"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

export function ThreadClient({ conversationId, other }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  async function load() {
    const res = await fetch(`/api/conversations/${conversationId}/messages`);
    const data = await res.json();
    setMessages(data.messages || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000); // simple polling — no websockets yet
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    setText("");
    try {
      await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      await load();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-line pb-4">
        <Link href="/messages" className="text-sm text-muted hover:text-ink">
          ←
        </Link>
        <Avatar name={other?.name} photoUrl={other?.photoUrl} size={36} />
        {other ? (
          <Link href={`/alumni/${other.id}`} className="text-sm font-semibold text-ink hover:underline">
            {other.name}
          </Link>
        ) : (
          <span className="text-sm font-semibold text-ink">Maharajian</span>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto py-6">
        {loading && <p className="text-sm text-muted">Loading…</p>}
        {!loading && messages.length === 0 && (
          <p className="text-sm text-muted">Say hello 👋 — this is the start of your conversation.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.mine ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.mine ? "bg-maroon text-white" : "border border-line bg-white text-ink"
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-line pt-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message…"
          className="flex-1 rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-maroon/50 focus:ring-2 focus:ring-maroon/10"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="rounded-lg bg-maroon px-5 py-2.5 text-sm font-medium text-white hover:bg-maroon-dark disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
