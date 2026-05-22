"use client";

import Link from "next/link";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ListPagination } from "@/components/list-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AssignmentHistoryEntry } from "@/lib/services/assets";
import type { PaginationState } from "@/lib/services/pagination";

type AssignmentHistoryListProps = {
  rows: AssignmentHistoryEntry[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  pagination: PaginationState | null;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

function label(value: string | null): string {
  return value?.trim() ? value : "—";
}

function formatChange(from: string | null, to: string | null): string {
  const before = label(from);
  const after = label(to);
  if (before === after) return after;
  return `${before} → ${after}`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AssignmentHistoryTimeline({
  rows,
  loading,
  search,
  onSearchChange,
  pagination,
  onPageChange,
  onLimitChange,
}: AssignmentHistoryListProps) {
  const total = pagination?.total ?? 0;
  const isEmpty = !loading && total === 0;

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by asset, user, or note..."
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[160px]">Date & time</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Assigned to</TableHead>
              <TableHead>Managed by</TableHead>
              <TableHead>Changed by</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : isEmpty ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {search.trim()
                    ? "No results match your search."
                    : "No assignment history yet."}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDateTime(row.changed_at)}
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/assets/${row.asset_id}`}
                      className="text-primary hover:underline"
                    >
                      {row.asset_name?.trim() || `Asset #${row.asset_id}`}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {formatChange(row.previous_user_name, row.assigned_to_user_name)}
                  </TableCell>
                  <TableCell>
                    {formatChange(
                      row.previous_managed_by_user_name,
                      row.managed_by_user_name,
                    )}
                  </TableCell>
                  <TableCell>{label(row.changed_by_user_name)}</TableCell>
                  <TableCell
                    className="max-w-[220px] truncate text-muted-foreground"
                    title={row.note?.trim() || undefined}
                  >
                    {label(row.note)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <ListPagination
          pagination={pagination}
          label="records"
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      </div>
    </div>
  );
}
