"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Eye,
  Filter,
  Loader2,
  Search,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/venues/status-badge";

function FunnelStep({ label, value, rate, color, width }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {value.toLocaleString()}
          {rate != null && ` · ${rate}%`}
        </span>
      </div>
      <div className="h-10 overflow-hidden rounded-lg bg-muted">
        <div
          className={`flex h-full items-center px-3 text-sm font-medium text-white transition-all ${color}`}
          style={{ width: `${Math.max(width, 8)}%` }}
        >
          {value.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function VenueStatsTable({ venues, highlight }) {
  if (!venues.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No data yet — activity will appear as visitors browse venues
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Venue</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">
              {highlight === "views" ? "Views" : "Search hits"}
            </TableHead>
            <TableHead className="hidden text-right sm:table-cell">Views</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Searches</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {venues.map((venue, i) => (
            <TableRow key={venue.id}>
              <TableCell className="text-muted-foreground">{i + 1}</TableCell>
              <TableCell className="font-medium">{venue.name}</TableCell>
              <TableCell>
                <StatusBadge status={venue.status} />
              </TableCell>
              <TableCell className="text-right font-semibold">
                {highlight === "views" ? venue.viewCount : venue.searchHits}
              </TableCell>
              <TableCell className="hidden text-right text-muted-foreground sm:table-cell">
                {venue.viewCount}
              </TableCell>
              <TableCell className="hidden text-right text-muted-foreground sm:table-cell">
                {venue.searchHits}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getAnalytics()
      .then((res) => setData(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const funnel = data?.funnel;
  const maxFunnel = Math.max(
    funnel?.listViews ?? 0,
    funnel?.searches ?? 0,
    funnel?.detailViews ?? 0,
    1
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Venue Analytics</h1>
        <p className="text-muted-foreground">
          Funnel insights — browse, search, and detail views
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Detail Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.totals.totalVenueViews}</div>
                <p className="text-xs text-muted-foreground">Across all venues</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Searches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.totals.totalSearches}</div>
                <p className="text-xs text-muted-foreground">Search queries performed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Search Impressions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.totals.totalSearchHits}</div>
                <p className="text-xs text-muted-foreground">Venue appearances in results</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  View Conversion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{funnel.viewFromListRate}%</div>
                <p className="text-xs text-muted-foreground">List browse → detail view</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Visitor Funnel
              </CardTitle>
              <CardDescription>
                Browse venues → search → open venue detail
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FunnelStep
                label="1. Browse venue list"
                value={funnel.listViews}
                color="bg-blue-500"
                width={(funnel.listViews / maxFunnel) * 100}
              />
              <FunnelStep
                label="2. Search venues"
                value={funnel.searches}
                rate={funnel.searchFromListRate}
                color="bg-violet-500"
                width={(funnel.searches / maxFunnel) * 100}
              />
              <FunnelStep
                label="3. View venue detail"
                value={funnel.detailViews}
                rate={funnel.viewFromSearchRate}
                color="bg-emerald-500"
                width={(funnel.detailViews / maxFunnel) * 100}
              />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Most Viewed Venues
                </CardTitle>
                <CardDescription>Top venues by detail page views</CardDescription>
              </CardHeader>
              <CardContent>
                <VenueStatsTable
                  venues={data.topViewedVenues.filter((v) => v.viewCount > 0)}
                  highlight="views"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Most Searched Venues
                </CardTitle>
                <CardDescription>Venues appearing most in search results</CardDescription>
              </CardHeader>
              <CardContent>
                <VenueStatsTable
                  venues={data.topSearchedVenues}
                  highlight="searches"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Search Terms
                </CardTitle>
                <CardDescription>Most popular search queries</CardDescription>
              </CardHeader>
              <CardContent>
                {data.topSearchQueries.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No searches recorded yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.topSearchQueries.map((item, i) => (
                      <div
                        key={item.query}
                        className="flex items-center justify-between rounded-lg border px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{i + 1}</span>
                          <span className="font-medium">&ldquo;{item.query}&rdquo;</span>
                        </div>
                        <Badge variant="secondary">{item.count} searches</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Searches</CardTitle>
                <CardDescription>Latest search activity</CardDescription>
              </CardHeader>
              <CardContent>
                {data.recentSearches.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No recent searches
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Query</TableHead>
                          <TableHead className="text-right">Results</TableHead>
                          <TableHead className="hidden text-right sm:table-cell">Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.recentSearches.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">
                              &ldquo;{log.searchQuery}&rdquo;
                            </TableCell>
                            <TableCell className="text-right">{log.resultCount}</TableCell>
                            <TableCell className="hidden text-right text-sm text-muted-foreground sm:table-cell">
                              {new Date(log.timestamp).toLocaleString("en-AU", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                All Venue Stats
              </CardTitle>
              <CardDescription>
                Complete breakdown of views and search hits per venue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VenueStatsTable venues={data.allVenueStats} highlight="views" />
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading analytics...
        </div>
      )}
    </div>
  );
}
