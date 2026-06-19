"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Building2, SlidersHorizontal } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { VenueCard } from "@/components/venues/venue-card";
import { VenueSearch } from "@/components/venues/venue-search";
import { VenuePagination } from "@/components/venues/venue-pagination";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { publicApi } from "@/lib/api";

const PAGE_SIZE = 9;

export function AllVenuesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "name_asc";

  const [venues, setVenues] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [searchInput, setSearchInput] = useState(search);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    async function loadVenues() {
      setLoading(true);
      setError("");

      try {
        const res = await publicApi.getVenues({
          search: search || undefined,
          page,
          limit: PAGE_SIZE,
          sort,
        });

        if (!cancelled) {
          setVenues(res.data);
          setPagination(res.pagination);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadVenues();
    return () => {
      cancelled = true;
    };
  }, [page, search, sort]);

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams.toString());

    if ("search" in updates) {
      const value = updates.search?.trim();
      if (value) params.set("search", value);
      else params.delete("search");
    }

    if ("sort" in updates) {
      const value = updates.sort;
      if (value && value !== "name_asc") params.set("sort", value);
      else params.delete("sort");
    }

    if ("page" in updates) {
      const value = updates.page;
      if (value && value > 1) params.set("page", String(value));
      else params.delete("page");
    }

    const query = params.toString();
    router.push(query ? `/venues?${query}` : "/venues");
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    updateParams({ search: searchInput, page: 1, sort });
  }

  function handleSortChange(value) {
    updateParams({ sort: value, page: 1, search });
  }

  function handlePageChange(nextPage) {
    updateParams({ page: nextPage, search, sort });
  }

  function clearFilters() {
    setSearchInput("");
    router.push("/venues");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">All Venues</h1>
          <p className="mt-1 text-muted-foreground">
            Browse every available venue
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-72">
            <div className="sticky top-24 rounded-xl border bg-card p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">Filters</h2>
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="venue-search">Search</Label>
                  <VenueSearch
                    value={searchInput}
                    onChange={setSearchInput}
                    placeholder="Search by name..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort">Sort by</Label>
                  <Select value={sort} onValueChange={handleSortChange}>
                    <SelectTrigger id="sort">
                      <SelectValue placeholder="Sort venues" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name_asc">Name (A–Z)</SelectItem>
                      <SelectItem value="name_desc">Name (Z–A)</SelectItem>
                      <SelectItem value="newest">Newest first</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Button type="submit" className="w-full">
                    Apply search
                  </Button>
                  {(search || sort !== "name_asc") && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </aside>

          <section className="min-w-0 flex-1">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {loading
                  ? "Loading..."
                  : `${pagination.total} venue${pagination.total !== 1 ? "s" : ""} found`}
              </p>
              {!loading && pagination.totalPages > 1 && (
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
              )}
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <Skeleton key={i} className="h-56 rounded-xl" />
                ))}
              </div>
            ) : venues.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
                <Building2 className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <h3 className="text-lg font-medium">No venues found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try changing your search or filters
                </p>
                <Button className="mt-4" variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {venues.map((venue) => (
                    <VenueCard key={venue.id} venue={venue} />
                  ))}
                </div>

                <div className="mt-10">
                  <VenuePagination
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
