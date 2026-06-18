"use client";

import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getAuditLogs()
      .then((res) => setLogs(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          History of all venue changes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>
            {loading ? "Loading..." : `${logs.length} log entr${logs.length !== 1 ? "ies" : "y"}`}
          </CardDescription>
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
              <p className="font-medium">No activity yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Changes to venues will appear here
              </p>
            </div>
          ) : (
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
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
