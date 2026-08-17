"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export function ChangePasswordClient() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mt-6 p-7">
      {done ? (
        <p className="rounded-lg bg-navy-soft px-3.5 py-2.5 text-sm text-navy">
          Password updated. Use it next time you log in.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Current password">
            <PasswordInput
              required
              value={form.currentPassword}
              onChange={update("currentPassword")}
              placeholder="••••••••"
            />
          </Field>
          <Field label="New password" hint="At least 8 characters">
            <PasswordInput
              required
              minLength={8}
              value={form.newPassword}
              onChange={update("newPassword")}
              placeholder="••••••••"
            />
          </Field>
          <Field label="Confirm new password">
            <PasswordInput
              required
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              placeholder="••••••••"
            />
          </Field>

          {error && (
            <p className="rounded-lg bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">{error}</p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading && <Spinner size={15} />}
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}
    </Card>
  );
}
