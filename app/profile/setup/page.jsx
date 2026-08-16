"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AvatarUpload } from "@/components/ui/AvatarUpload";
import {
  PASSING_YEARS,
  COURSES,
  DEPARTMENTS,
  PROFESSIONS,
  HOSTEL_STATUS,
  COUNTRIES,
  INDIA_STATES,
  INDIA_STATES_AND_CITIES,
} from "@/lib/data/options";

const initialForm = {
  admissionYear: "",
  passingYear: "",
  course: "",
  department: "",
  homeTown: "",
  homeState: "",
  currentCity: "",
  currentState: "",
  currentCountry: "India",
  profession: "",
  organization: "",
  designation: "",
  hostelStatus: "",
  isPublic: true,
};

function CityField({ label, state, value, onChange }) {
  const cityOptions = INDIA_STATES_AND_CITIES[state] || [];
  const isCustom = value && !cityOptions.includes(value);

  return (
    <Field label={label}>
      {cityOptions.length > 0 && (
        <Select
          value={isCustom ? "Other" : value}
          onChange={(e) => onChange(e.target.value === "Other" ? "" : e.target.value)}
        >
          <option value="">Select a city</option>
          {cityOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
          <option value="Other">Other</option>
        </Select>
      )}
      {(cityOptions.length === 0 || isCustom) && (
        <Input
          className={cityOptions.length > 0 ? "mt-2" : ""}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="City name"
        />
      )}
    </Field>
  );
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [me, setMe] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const meRes = await fetch("/api/auth/me");
      const meJson = await meRes.json();
      if (!meJson.user) {
        router.push("/login");
        return;
      }
      if (cancelled) return;
      setMe(meJson.user);
      setVerificationStatus(meJson.user.verificationStatus);

      const profileRes = await fetch("/api/profile");
      const { profile } = await profileRes.json().catch(() => ({ profile: null }));
      if (cancelled) return;
      if (profile) {
        setForm((f) => ({
          ...f,
          ...Object.fromEntries(
            Object.keys(f)
              .filter((key) => key !== "isPublic" && key !== "currentCountry")
              .map((key) => [key, profile[key] ?? ""])
          ),
          currentCountry: profile.currentCountry || "India",
          isPublic: profile.isPublic !== false,
        }));
      }
      setStatus("ready");
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function update(field) {
    return (e) => set(field, e.target.value);
  }

  function goNext() {
    router.push(verificationStatus === "pending" ? "/pending" : "/me/profile");
    router.refresh();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      goNext();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
        <p className="text-sm text-muted">Loading…</p>
      </main>
    );
  }

  const isIndia = form.currentCountry === "India";

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 self-start font-display text-lg text-ink">
        Maharaja Parivar
      </Link>

      <Card className="p-7 sm:p-9">
        <h1 className="text-lg font-semibold text-ink">Tell us about your Maharaja days</h1>
        <p className="mt-1 text-sm text-muted">
          This is what our team looks at to verify you&rsquo;re a genuine Maharajian —
          and what other alumni will search by once you&rsquo;re in the directory.
        </p>

        <div className="mt-6">
          <AvatarUpload
            name={me?.name}
            photoUrl={me?.photoUrl}
            onUploaded={(url) => setMe((m) => ({ ...m, photoUrl: url }))}
          />
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="border-t border-line pt-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
              Your Maharaja College record
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Admission year">
                <Select value={form.admissionYear} onChange={update("admissionYear")}>
                  <option value="">Select a year</option>
                  {PASSING_YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Pass-out year">
                <Select value={form.passingYear} onChange={update("passingYear")}>
                  <option value="">Select a year</option>
                  {PASSING_YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Stream / Department">
                <Select value={form.department} onChange={update("department")}>
                  <option value="">Select a stream</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Course">
                <Select value={form.course} onChange={update("course")}>
                  <option value="">Select a course</option>
                  {COURSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Hosteller or day scholar">
                <Select value={form.hostelStatus} onChange={update("hostelStatus")}>
                  <option value="">Prefer not to say</option>
                  {HOSTEL_STATUS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>

          <div className="border-t border-line pt-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
              Home town
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Home state">
                <Select value={form.homeState} onChange={update("homeState")}>
                  <option value="">Select a state</option>
                  {INDIA_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </Field>
              <CityField
                label="Home town"
                state={form.homeState}
                value={form.homeTown}
                onChange={(v) => set("homeTown", v)}
              />
            </div>
          </div>

          <div className="border-t border-line pt-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
              Where you are today
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Current country">
                <Select value={form.currentCountry} onChange={update("currentCountry")}>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              {isIndia ? (
                <Field label="Current state">
                  <Select value={form.currentState} onChange={update("currentState")}>
                    <option value="">Select a state</option>
                    {INDIA_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </Field>
              ) : (
                <Field label="Current state / region">
                  <Input value={form.currentState} onChange={update("currentState")} placeholder="e.g. California" />
                </Field>
              )}
              {isIndia ? (
                <CityField
                  label="Current city"
                  state={form.currentState}
                  value={form.currentCity}
                  onChange={(v) => set("currentCity", v)}
                />
              ) : (
                <Field label="Current city">
                  <Input value={form.currentCity} onChange={update("currentCity")} placeholder="e.g. San Francisco" />
                </Field>
              )}
            </div>
          </div>

          <div className="border-t border-line pt-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
              What you do now <span className="normal-case text-muted/70">(optional)</span>
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Profession">
                <Select value={form.profession} onChange={update("profession")}>
                  <option value="">Select a profession</option>
                  {PROFESSIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Current designation">
                <Input value={form.designation} onChange={update("designation")} placeholder="e.g. Deputy Superintendent of Police" />
              </Field>
              <Field label="Organization" className="sm:col-span-2">
                <Input value={form.organization} onChange={update("organization")} placeholder="Government of Maharashtra" />
              </Field>
            </div>
          </div>

          <div className="border-t border-line pt-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
              Visibility
            </p>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-panel-soft p-4">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => set("isPublic", e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-maroon"
              />
              <span>
                <span className="block text-sm font-medium text-ink">
                  Public profile — listed in the directory
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  Verified Maharajians (and guests, if they have your link) can find you by
                  name, city, batch or profession. Turn this off to stay verified but
                  unlisted. Your phone, email and address are never shown publicly either way.
                </span>
              </span>
            </label>
          </div>

          {error && (
            <p className="rounded-lg bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">{error}</p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={goNext}
              className="text-sm text-muted hover:text-ink"
            >
              Finish this later
            </button>
            <Button type="submit" size="lg" disabled={saving}>
              {saving ? "Saving…" : "Save and continue"}
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
