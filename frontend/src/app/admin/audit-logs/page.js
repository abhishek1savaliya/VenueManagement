"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Calendar,
  Loader2,
  ServerCrash,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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

const LOG_TABS = [
  {
    id: "venue",
    label: "Venue Logs",
    icon: Building2,
    description: "Create, update, and delete actions on venues",
    emptyMessage: "Venue changes will appear here",
  },
  {
    id: "user",
    label: "User Logs",
    icon: Users,
    description: "Account registration, profile updates, and deletions",
    emptyMessage: "User activity will appear here",
  },
  {
    id: "general",
    label: "General Logs",
    icon: AlertTriangle,
    description: "Errors, access denied, downtime, and system warnings",
    emptyMessage: "System errors and access issues will appear here",
  },
];

const actionVariants = {
  created: "success",
  updated: "secondary",
  deleted: "destructive",
  error: "destructive",
  downtime: "destructive",
  no_access: "secondary",
  fallback: "outline",
  warning: "outline",
};

const generalTypeLabels = {
  error: "Error",
  fallback: "Fallback",
  downtime: "Downtime",
  no_access: "No Access",
  warning: "Warning",
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

function VenueUserTable({ logs, category }) {
  const nameKey = category === "venue" ? "venueName" : "userName";
  const idKey = category === "venue" ? "venueId" : "userId";
  const nameLabel = category === "venue" ? "Venue" : "User";
  const idLabel = category === "venue" ? "Venue ID" : "User ID";

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Action</TableHead>
          <TableHead>{nameLabel}</TableHead>
          <TableHead className="hidden sm:table-cell">{idLabel}</TableHead>
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
            <TableCell className="font-medium">{log[nameKey]}</TableCell>
            <TableCell className="hidden text-muted-foreground sm:table-cell">
              {log[idKey] ?? "—"}
            </TableCell>
            <TableCell className="text-right text-sm text-muted-foreground">
              {formatTimestamp(log.timestamp)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function GeneralLogTable({ logs }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Message</TableHead>
          <TableHead className="hidden md:table-cell">Source</TableHead>
          <TableHead className="hidden sm:table-cell text-right">Status</TableHead>
          <TableHead className="text-right">Timestamp</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell>
              <Badge variant={actionVariants[log.actionType] || "destructive"}>
                {generalTypeLabels[log.actionType] || log.actionType}
              </Badge>
            </TableCell>
            <TableCell className="max-w-xs font-medium sm:max-w-md">
              <span className="line-clamp-2">{log.message}</span>
            </TableCell>
            <TableCell className="hidden max-w-[200px] truncate text-muted-foreground md:table-cell">
              {log.source || "—"}
            </TableCell>
            <TableCell className="hidden text-right text-muted-foreground sm:table-cell">
              {log.statusCode ?? "—"}
            </TableCell>
            <TableCell className="text-right text-sm text-muted-foreground">
              {formatTimestamp(log.timestamp)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function AuditLogsPage() {
  const [activeTab, setActiveTab] = useState("venue");
  const [logs, setLogs] = useState([]);
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef(null);
  const fetchingMoreRef = useRef(false);

  const currentTab = LOG_TABS.find((t) => t.id === activeTab) || LOG_TABS[0];
  const TabIcon = currentTab.icon;

  const loadLogs = useCallback(
    async (category, pageToLoad, date, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const res = await adminApi.getAuditLogs({
          category,
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
    },
    []
  );

  useEffect(() => {
    setLogs([]);
    setPage(1);
    loadLogs(activeTab, 1, dateFilter, false);
  }, [activeTab, dateFilter, loadLogs]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || fetchingMoreRef.current) return;

        fetchingMoreRef.current = true;
        loadLogs(activeTab, page + 1, dateFilter, true).finally(() => {
          fetchingMoreRef.current = false;
        });
      },
      { rootMargin: "120px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [activeTab, hasMore, loading, loadingMore, page, dateFilter, loadLogs]);

  const countLabel = loading
    ? "Loading..."
    : `${total} log entr${total !== 1 ? "ies" : "y"}${dateFilter ? ` on ${dateFilter}` : ""}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          Venue, user, and system activity history
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {LOG_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={cn("gap-2", isActive && "shadow-sm")}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TabIcon className="h-5 w-5" />
                {currentTab.label}
              </CardTitle>
              <CardDescription>{countLabel}</CardDescription>
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
                    onClick={() => setDateFilter("")}
                    aria-label="Clear date filter"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{currentTab.description}</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              {activeTab === "general" ? (
                <ServerCrash className="mb-3 h-10 w-10 text-muted-foreground/40" />
              ) : activeTab === "user" ? (
                <Users className="mb-3 h-10 w-10 text-muted-foreground/40" />
              ) : (
                <Building2 className="mb-3 h-10 w-10 text-muted-foreground/40" />
              )}
              <p className="font-medium">No activity found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {dateFilter
                  ? "Try a different date or clear the filter"
                  : currentTab.emptyMessage}
              </p>
              {activeTab === "general" && !dateFilter && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Logs errors, 401/403/404 access issues, and database downtime
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border">
                {activeTab === "general" ? (
                  <GeneralLogTable logs={logs} />
                ) : (
                  <VenueUserTable logs={logs} category={activeTab} />
                )}
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
