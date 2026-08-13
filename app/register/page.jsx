"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialForm = { name: "", email: "", password: "", phone: "" };

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      // Batch, course and location come next, on the profile-setup page —
      // not on this form.
      router.push("/profile/setup");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-16">
      <div className="grid w-full gap-10 lg:grid-cols-[0.9fr_1fr] lg:items-center">
        <div className="hidden lg:block">
          <Link href="/" className="font-display text-lg text-ink">
            Maharaja Parivaar
          </Link>
          <h1 className="mt-6 font-display text-[34px] leading-tight text-ink text-balance">
            Join the founding cohort of Maharajians.
          </h1>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
            Create your account in a minute — you&rsquo;ll add your batch, course and city
            right after, and the founder reviews every new member by hand.
          </p>
        </div>

        <Card className="p-7 sm:p-9">
          <div className="mb-6 lg:hidden">
            <Link href="/" className="font-display text-lg text-ink">
              Maharaja Parivaar
            </Link>
          </div>
          <h2 className="text-lg font-semibold text-ink">Create your account</h2>
          <p className="mt-1 text-sm text-muted">
            Already registered? <Link href="/login" className="text-maroon hover:underline">Log in</Link>.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <Field label="Full name">
              <Input required value={form.name} onChange={update("name")} placeholder="Jitendra Sain" />
            </Field>

            <Field label="Email">
              <Input
                type="email"
                required
                value={form.email}
                onChange={update("email")}
                placeholder="you@example.com"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Password" hint="At least 8 characters">
                <Input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={update("password")}
                  placeholder="••••••••"
                />
              </Field>
              <Field label="Phone (optional)">
                <Input value={form.phone} onChange={update("phone")} placeholder="98xxxxxxxx" />
              </Field>
            </div>

            {error && (
              <p className="rounded-lg bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">{error}</p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creating your account…" : "Create account"}
            </Button>

            <p className="text-center text-xs text-muted">
              Next you&rsquo;ll tell us about your time at Maharaja College — that&rsquo;s
              what the founder reviews before your profile goes live.
            </p>
          </form>
        </Card>
      </div>
    </main>
  );
}
