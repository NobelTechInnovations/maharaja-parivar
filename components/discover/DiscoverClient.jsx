"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { PROFESSIONS, PASSING_YEARS } from "@/lib/data/options";

const initialFilters = { q: "", city: "", profession: "", batch: "" };

export function DiscoverClient() {
  const [filters, setFilters] = useState(initialFilters);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(async (f) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      Object.entries(f).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const res = await fetch(`/api/alumni?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't load the directory.");
        setResults([]);
        return;
      }
      setResults(data.results);
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    runSearch(initialFilters);
  }, [runSearch]);

  function update(field) {
    return (e) => setFilters((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    runSearch(filters);
  }

  return (
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input placeholder="Name" value={filters.q} onChange={update("q")} className="lg:col-span-1" />
        <Input placeholder="City" value={filters.city} onChange={update("city")} className="lg:col-span-1" />
        <Select value={filters.profession} onChange={update("profession")} className="lg:col-span-1">
          <option value="">Any profession</option>
          {PROFESSIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </Select>
        <Select value={filters.batch} onChange={update("batch")} className="lg:col-span-1">
          <option value="">Passout Year</option>
          {PASSING_YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </Select>
        <Button type="submit" className="lg:col-span-1">
          Search
        </Button>
      </form>

      <div className="mt-8">
        {loading && <p className="text-sm text-muted">Searching…</p>}
        {error && <p className="text-sm text-maroon">{error}</p>}
        {!loading && !error && searched && results.length === 0 && (
          <p className="text-sm text-muted">No Maharaja Fellow match that search yet.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex items-center gap-3">
                <Avatar name={r.name} photoUrl={r.photoUrl} size={44} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-ink">{r.name}</div>
                  <div className="truncate text-xs text-muted">
                    {r.course || "Maharaja College"}
                    {r.passingYear ? ` · Batch ${r.passingYear}` : ""}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-0.5 text-sm text-muted">
                {r.profession && (
                  <div className="truncate">
                    {r.profession}
                    {r.organization ? ` · ${r.organization}` : ""}
                  </div>
                )}
                {r.currentCity && (
                  <div className="truncate">
                    {r.currentCity}
                    {r.currentState ? `, ${r.currentState}` : ""}
                  </div>
                )}
                <div className="text-xs text-muted/80">
                  {r.followerCount} {r.followerCount === 1 ? "follower" : "followers"}
                </div>
              </div>
              <Link
                href={`/alumni/${r.id}`}
                className="mt-4 inline-block text-sm font-medium text-maroon hover:underline"
              >
                View profile →
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
