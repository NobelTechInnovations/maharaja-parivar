"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export function AutoApproveToggle() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setEnabled(Boolean(data.autoApproveEnabled)))
      .finally(() => setLoading(false));
  }, []);

  async function toggle() {
    const next = !enabled;
    setEnabled(next); // optimistic
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoApproveEnabled: next }),
      });
      if (!res.ok) setEnabled(!next); // revert on failure
    } catch {
      setEnabled(!next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mt-6 flex items-center justify-between gap-4 p-5">
      <div>
        <div className="text-sm font-semibold text-ink">Auto-approve new registrations</div>
        <p className="mt-0.5 text-xs text-muted">
          {loading
            ? "Loading…"
            : enabled
              ? "On — new accounts are verified instantly, skipping this queue."
              : "Off — new accounts wait here for you to approve them by hand."}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={loading || saving}
        onClick={toggle}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50",
          enabled ? "bg-maroon" : "bg-line"
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform",
            enabled ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </Card>
  );
}
