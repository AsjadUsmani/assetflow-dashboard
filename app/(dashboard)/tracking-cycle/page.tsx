"use client";

import { useCallback, useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { AssignmentHistoryTimeline } from "@/components/tracking/assignment-history-timeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAssignmentHistoryPage,
  type AssignmentHistoryEntry,
} from "@/lib/services/assets";
import type { PaginationState } from "@/lib/services/pagination";

export default function TrackingCyclePage() {
  const [rows, setRows] = useState<AssignmentHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState<PaginationState | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAssignmentHistoryPage({
        page,
        limit,
        search: search.trim() || undefined,
      });
      setRows(data.items);
      setPagination(data.pagination);
    } catch {
      setRows([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    setPage(1);
  }, [search, limit]);

  const total = pagination?.total ?? 0;

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Overview", href: "/dashboard" },
          { label: "Assignment Tracking" },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Assignment Tracking</h1>
            <p className="text-sm text-muted-foreground">
              History of who was assigned to each asset and who manages it.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Change history</CardTitle>
              <CardDescription>
                {loading
                  ? "Loading records..."
                  : `${total} record${total !== 1 ? "s" : ""} total`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssignmentHistoryTimeline
                rows={rows}
                loading={loading}
                search={search}
                onSearchChange={setSearch}
                pagination={pagination}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
