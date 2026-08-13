"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

const SHAREABLE = [
  { key: "phone", label: "phone number" },
  { key: "email", label: "email" },
];

export function ConnectionsClient() {
  const router = useRouter();
  const [data, setData] = useState({ received: [], sent: [], accepted: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/connections");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Couldn't load your connections.");
        return;
      }
      setData(json);
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function respond(id, action) {
    setBusyId(id);
    try {
      await fetch(`/api/connections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function toggleShare(connection, field) {
    setBusyId(connection.id);
    try {
      const current = new Set(connection.myShares);
      current.has(field) ? current.delete(field) : current.add(field);
      await fetch(`/api/connections/${connection.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: [...current] }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function openMessage(userId) {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ withUserId: userId }),
    });
    const json = await res.json();
    if (res.ok) router.push(`/messages/${json.id}`);
  }

  if (loading) return <p className="mt-8 text-sm text-muted">Loading…</p>;
  if (error) return <p className="mt-8 text-sm text-maroon">{error}</p>;

  return (
    <div className="mt-8 space-y-10">
      {data.received.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Requests waiting on you
          </h2>
          <div className="mt-3 space-y-3">
            {data.received.map((c) => (
              <Card key={c.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={c.user.name} photoUrl={c.user.photoUrl} size={40} />
                  <div>
                    <Link href={`/alumni/${c.user.id}`} className="text-sm font-semibold text-ink hover:underline">
                      {c.user.name}
                    </Link>
                    {c.note && <p className="mt-0.5 text-xs text-muted">&ldquo;{c.note}&rdquo;</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="md" disabled={busyId === c.id} onClick={() => respond(c.id, "decline")}>
                    Decline
                  </Button>
                  <Button size="md" disabled={busyId === c.id} onClick={() => respond(c.id, "accept")}>
                    Accept
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          My connections ({data.accepted.length})
        </h2>
        {data.accepted.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No connections yet — find someone in the{" "}
            <Link href="/discover" className="text-maroon hover:underline">directory</Link> and send a request.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {data.accepted.map((c) => (
              <Card key={c.id} className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={c.user.name} photoUrl={c.user.photoUrl} size={40} />
                    <div>
                      <Link href={`/alumni/${c.user.id}`} className="text-sm font-semibold text-ink hover:underline">
                        {c.user.name}
                      </Link>
                      {(c.user.phone || c.user.email) && (
                        <p className="mt-0.5 text-xs text-muted">
                          Shared with you:{" "}
                          {[c.user.phone, c.user.email].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="secondary" size="md" onClick={() => openMessage(c.user.id)}>
                    Message
                  </Button>
                </div>

                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Share your details with {c.user.name.split(" ")[0]}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SHAREABLE.map(({ key, label }) => {
                      const active = c.myShares.includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={busyId === c.id}
                          onClick={() => toggleShare(c, key)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            active
                              ? "border-maroon bg-maroon-soft text-maroon"
                              : "border-line text-muted hover:border-maroon/40 hover:text-maroon"
                          }`}
                        >
                          {active ? "✓ Sharing " : "Share "}
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {data.sent.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Requests you&rsquo;ve sent
          </h2>
          <div className="mt-3 space-y-3">
            {data.sent.map((c) => (
              <Card key={c.id} className="flex items-center gap-3 p-5">
                <Avatar name={c.user.name} photoUrl={c.user.photoUrl} size={40} />
                <div className="flex-1">
                  <Link href={`/alumni/${c.user.id}`} className="text-sm font-semibold text-ink hover:underline">
                    {c.user.name}
                  </Link>
                  <p className="text-xs text-muted">Waiting for them to respond</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
