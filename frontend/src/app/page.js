"use client";

import { useEffect, useState } from "react";
import { Building2, Sparkles } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { VenueCard } from "@/components/venues/venue-card";
import { VenueSearch } from "@/components/venues/venue-search";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/lib/api";

export default function HomePage() {
  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const res = await publicApi.getVenues(search || undefined);
        setVenues(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-accent/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Curated event spaces
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find Your Perfect
              <span className="block text-primary">Venue</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
              Browse premium event spaces for weddings, conferences, and
              celebrations. Every venue is hand-selected for quality.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Available Venues
            </h2>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${venues.length} venue${venues.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
          <VenueSearch value={search} onChange={setSearch} />
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
            <Building2 className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-medium">No venues found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? "Try a different search term" : "Check back soon for new venues"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          © {new Date().getFullYear()} MyVenue. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
