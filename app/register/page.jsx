"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { BackLink } from "@/components/ui/BackLink";
import { Spinner } from "@/components/ui/Spinner";

const initialForm = { name: "", email: "", password: "", phone: "" };

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState("idle"); // idle | checking | taken | available

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  // Debounced "is this email already registered" check, so people find
  // out before they fill in the rest of the form rather than after.
  useEffect(() => {
    const email = form.email.trim();
    if (!email.includes("@")) {
      setEmailStatus("idle");
      return;
    }
    setEmailStatus("checking");
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        setEmailStatus(data.exists ? "taken" : "available");
      } catch {
        setEmailStatus("idle");
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [form.email]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("Please agree to the Terms & Community Guidelines to continue.");
      return;
    }
    if (emailStatus === "taken") {
      setError("An account with this email already exists.");
      return;
    }

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
            right after, and our team reviews every new member by hand.
          </p>
        </div>

        <Card className="p-7 sm:p-9">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <BackLink fallbackHref="/" />
            <Link href="/" className="font-display text-lg text-ink">
              Maharaja Parivaar
            </Link>
          </div>
          <div className="hidden lg:block">
            <BackLink fallbackHref="/" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-ink lg:mt-3">Create your account</h2>
          <p className="mt-1 text-sm text-muted">
            Already registered? <Link href="/login" className="text-maroon hover:underline">Log in</Link>.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <Field label="Full name">
              <Input required value={form.name} onChange={update("name")} placeholder="Ramesh Sharma" />
            </Field>

            <Field
              label="Email"
              error={emailStatus === "taken" ? "An account with this email already exists." : ""}
              hint={emailStatus === "checking" ? "Checking…" : emailStatus === "available" ? "Available ✓" : ""}
            >
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
                <PasswordInput
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

            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-maroon"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="text-maroon hover:underline">
                  Terms &amp; Community Guidelines
                </Link>
              </span>
            </label>

            {error && (
              <p className="rounded-lg bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">{error}</p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading || !agreed}>
              {loading && <Spinner size={15} />}
              {loading ? "Creating your account…" : "Create account"}
            </Button>

            <p className="text-center text-xs text-muted">
              Next you&rsquo;ll tell us about your time at Maharaja College — that&rsquo;s
              what our team reviews before your profile goes live.
            </p>
          </form>
        </Card>
      </div>
    </main>
  );
}
