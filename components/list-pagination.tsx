"use client"

import { Button } from "@/components/ui/button"
import type { PaginationState } from "@/lib/services/pagination"

export function ListPagination({
  pagination,
  label,
  onPageChange,
}: {
  pagination: PaginationState | null | undefined
  label: string
  onPageChange: (page: number) => void
}) {
  if (!pagination || pagination.total === 0) return null

  const start = (pagination.page - 1) * pagination.limit + 1
  const end = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {start}-{end} of {pagination.total} {label}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
          disabled={!pagination.has_previous_page}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {pagination.page} of {pagination.total_pages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={!pagination.has_next_page}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
