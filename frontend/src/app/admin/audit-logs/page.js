"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Calendar, ClipboardList, Loader2, X } from "lucide-react";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api";

const PAGE_SIZE = 20;

const actionVariants = {
  created: "success",
  updated: "secondary",
  deleted: "destructive",
};

function formatTimestamp(ts) {
  return new Date(ts).toLocaleString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef(null);
  const fetchingMoreRef = useRef(false);

  const loadLogs = useCallback(async (pageToLoad, date, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await adminApi.getAuditLogs({
        date: date || undefined,
        page: pageToLoad,
        limit: PAGE_SIZE,
      });

      setLogs((prev) => (append ? [...prev, ...res.data] : res.data));
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
    loadLogs(1, dateFilter, false);
  }, [dateFilter, loadLogs]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || fetchingMoreRef.current) return;

        fetchingMoreRef.current = true;
        loadLogs(page + 1, dateFilter, true).finally(() => {
          fetchingMoreRef.current = false;
        });
      },
      { rootMargin: "120px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, dateFilter, loadLogs]);

  function clearDateFilter() {
    setDateFilter("");
  }

  const description = loading
    ? "Loading..."
    : `${total} log entr${total !== 1 ? "ies" : "y"}${dateFilter ? ` on ${dateFilter}` : ""}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">History of all venue changes</p>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>

            <div className="flex w-full max-w-xs flex-col gap-2">
              <Label htmlFor="date-filter">Filter by date</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="date-filter"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {dateFilter && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={clearDateFilter}
                    aria-label="Clear date filter"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <ClipboardList className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="font-medium">No activity found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {dateFilter
                  ? "Try a different date or clear the filter"
                  : "Changes to venues will appear here"}
              </p>
              {dateFilter && (
                <Button className="mt-4" variant="outline" onClick={clearDateFilter}>
                  Clear date filter
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead className="hidden sm:table-cell">Venue ID</TableHead>
                      <TableHead className="text-right">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant={actionVariants[log.actionType] || "outline"}>
                            {log.actionType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{log.venueName}</TableCell>
                        <TableCell className="hidden text-muted-foreground sm:table-cell">
                          {log.venueId ?? "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
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
                {!loadingMore && !hasMore && logs.length > 0 && (
                  <p className="text-sm text-muted-foreground">All logs loaded</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
