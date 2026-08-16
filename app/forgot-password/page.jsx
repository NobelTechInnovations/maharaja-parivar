"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BackLink } from "@/components/ui/BackLink";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <BackLink fallbackHref="/login" />
        <Link href="/" className="font-display text-lg text-ink">
          Maharaja Parivar
        </Link>
      </div>

      <Card className="p-7 sm:p-9">
        <h1 className="text-lg font-semibold text-ink">Reset your password</h1>
        <p className="mt-1 text-sm text-muted">
          Enter the email on your account and we&rsquo;ll send you a reset link.
        </p>

        {done ? (
          <p className="mt-6 rounded-lg bg-panel-soft px-3.5 py-2.5 text-sm text-ink">
            If <strong>{email}</strong> has an account, a reset link is on its way. It expires
            in an hour.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label="Email">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </Field>

            {error && (
              <p className="rounded-lg bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">{error}</p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}

        <p className="mt-5 text-sm text-muted">
          <Link href="/login" className="text-maroon hover:underline">Back to log in</Link>
        </p>
      </Card>
    </main>
  );
}
