"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { BackLink } from "@/components/ui/BackLink";
import { Spinner } from "@/components/ui/Spinner";

// Only ever follow a same-site path — never let a `next` value redirect
// off this domain.
function safeNext(value) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      const destination =
        data.user.verificationStatus === "pending" ? "/pending" : next || "/";
      router.push(destination);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <BackLink fallbackHref="/" />
        <Link href="/" className="font-display text-lg text-ink">
          Maharaja Parivaar
        </Link>
      </div>

      <Card className="p-7 sm:p-9">
        <h1 className="text-lg font-semibold text-ink">Log in</h1>
        <p className="mt-1 text-sm text-muted">
          New here? <Link href="/register" className="text-maroon hover:underline">Join the Parivaar</Link>.
        </p>
        {next && (
          <p className="mt-3 rounded-lg bg-panel-soft px-3.5 py-2.5 text-xs text-muted">
            Log in to continue where you left off.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Email">
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
            />
          </Field>
          <Field
            label="Password"
            hint={
              <Link href="/forgot-password" className="text-maroon hover:underline">
                Forgot password?
              </Link>
            }
          >
            <PasswordInput
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
            />
          </Field>

          {error && (
            <p className="rounded-lg bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">{error}</p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading && <Spinner size={15} />}
            {loading ? "Logging in…" : "Log in"}
          </Button>
        </form>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
