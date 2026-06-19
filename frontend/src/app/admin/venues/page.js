"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { VenueSearch } from "@/components/venues/venue-search";
import { StatusBadge } from "@/components/venues/status-badge";
import { adminApi } from "@/lib/api";

const PAGE_SIZE = 20;

export default function AdminVenuesPage() {
  const router = useRouter();
  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const loadMoreRef = useRef(null);
  const fetchingMoreRef = useRef(false);

  const loadVenues = useCallback(async (pageToLoad, query, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await adminApi.getVenues({
        search: query || undefined,
        page: pageToLoad,
        limit: PAGE_SIZE,
      });

      setVenues((prev) => (append ? [...prev, ...res.data] : res.data));
      setHasMore(res.pagination.hasMore);
      setTotal(res.pagination.total);
      setPage(pageToLoad);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadVenues(1, search, false), 300);
    return () => clearTimeout(timer);
  }, [search, loadVenues]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || fetchingMoreRef.current) return;

        fetchingMoreRef.current = true;
        loadVenues(page + 1, search, true).finally(() => {
          fetchingMoreRef.current = false;
        });
      },
      { rootMargin: "120px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, search, loadVenues]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteVenue(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      loadVenues(1, search, false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
          <p className="text-muted-foreground">
            Manage all venues in the system
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/venues/new">
            <Plus className="h-4 w-4" />
            Add Venue
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>All Venues</CardTitle>
            <CardDescription>
              {loading
                ? "Loading..."
                : `${total} venue${total !== 1 ? "s" : ""}`}
            </CardDescription>
          </div>
          <VenueSearch value={search} onChange={setSearch} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : venues.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Building2 className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="font-medium">No venues found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {search ? "Try a different search" : "Create your first venue"}
              </p>
              {!search && (
                <Button className="mt-4" asChild>
                  <Link href="/admin/venues/new">
                    <Plus className="h-4 w-4" />
                    Add Venue
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {venues.map((venue) => (
                      <TableRow key={venue.id}>
                        <TableCell className="font-medium">{venue.name}</TableCell>
                        <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
                          {venue.address}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={venue.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(`/admin/venues/${venue.id}/edit`)
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(venue)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div ref={loadMoreRef} className="flex justify-center py-6">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more...
                  </div>
                )}
                {!loadingMore && !hasMore && venues.length > 0 && (
                  <p className="text-sm text-muted-foreground">All venues loaded</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Venue</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
