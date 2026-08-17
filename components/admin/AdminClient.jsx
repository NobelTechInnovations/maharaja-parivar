"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "verified", label: "Verified" },
  { key: "rejected", label: "Rejected" },
];

export function AdminClient() {
  const [tab, setTab] = useState("pending");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [resetResults, setResetResults] = useState({}); // userId -> { email, temporaryPassword }

  const load = useCallback(async (status) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users?status=${status}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't load this list.");
        setUsers([]);
        return;
      }
      setUsers(data.users);
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  async function act(id, action) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setUsers((list) => list.filter((u) => u.id !== id));
      }
    } finally {
      setBusyId(null);
    }
  }

  async function resetPassword(id) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}/reset-password`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setResetResults((r) => ({ ...r, [id]: data }));
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-8">
      <div className="flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "px-3.5 py-2.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-b-2 border-maroon text-ink"
                : "border-b-2 border-transparent text-muted hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-muted">Loading…</p>}
        {error && <p className="text-sm text-maroon">{error}</p>}
        {!loading && !error && users.length === 0 && (
          <p className="text-sm text-muted">No {tab} accounts right now.</p>
        )}

        {users.map((u) => (
          <Card key={u.id} className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={u.name} size={40} />
                <div>
                  <div className="text-sm font-semibold text-ink">{u.name}</div>
                  <div className="text-xs text-muted">
                    {u.email}
                    {u.phone ? ` · ${u.phone}` : ""}
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {u.profile?.course || "No course given"}
                    {u.profile?.passingYear ? ` · Batch ${u.profile.passingYear}` : ""}
                    {u.profile?.currentCity ? ` · ${u.profile.currentCity}` : ""}
                    {!u.profile?.course && !u.profile?.passingYear && !u.profile?.currentCity && (
                      <span> — profile not filled in yet</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {tab === "pending" && (
                  <>
                    <Button
                      size="md"
                      variant="secondary"
                      disabled={busyId === u.id}
                      onClick={() => act(u.id, "reject")}
                    >
                      Reject
                    </Button>
                    <Button size="md" disabled={busyId === u.id} onClick={() => act(u.id, "approve")}>
                      Approve
                    </Button>
                  </>
                )}
                <Button
                  size="md"
                  variant="secondary"
                  disabled={busyId === u.id}
                  onClick={() => resetPassword(u.id)}
                >
                  Reset password
                </Button>
              </div>
            </div>

            {resetResults[u.id] && (
              <div className="mt-4 rounded-lg border border-line bg-panel-soft p-3.5 text-sm">
                <p className="font-medium text-ink">
                  New password: <code className="rounded bg-white px-1.5 py-0.5">{resetResults[u.id].temporaryPassword}</code>
                </p>
                <p className="mt-1 text-xs text-muted">
                  Share this with {u.name.split(" ")[0]} directly (call, WhatsApp, in person) — it
                  isn&rsquo;t emailed. Their old password no longer works. Ask them to change it
                  once they&rsquo;re back in.
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
