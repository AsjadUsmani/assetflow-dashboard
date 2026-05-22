"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import type { PaginationState } from "@/lib/services/pagination"

export function ListPagination({
  pagination,
  label,
  onPageChange,
  onLimitChange,
}: {
  pagination: PaginationState | null | undefined
  label: string
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}) {
  if (!pagination || pagination.total === 0) return null

  const start = (pagination.page - 1) * pagination.limit + 1
  const end = Math.min(pagination.page * pagination.limit, pagination.total)
  const { page, total_pages } = pagination

  // Show up to 3 pages around the current page
  const getPageNumbers = () => {
    const pages: number[] = []
    let startPage = Math.max(1, page - 1)
    let endPage = Math.min(total_pages, startPage + 2)
    
    if (endPage - startPage < 2 && startPage > 1) {
      startPage = Math.max(1, endPage - 2)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className="flex flex-col gap-4 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Rows per page</span>
          {onLimitChange ? (
            <Select
              value={String(pagination.limit)}
              onValueChange={(val) => onLimitChange(Number(val))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={String(pagination.limit)} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-sm text-muted-foreground">{pagination.limit}</span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {start} to {end} of {pagination.total} {label}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          className="size-8 p-0"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          className="size-8 p-0"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={!pagination.has_previous_page}
        >
          <ChevronLeft className="size-4" />
        </Button>
        
        {pages.map((p) => (
          <Button
            key={p}
            variant={page === p ? "default" : "outline"}
            className="size-8 p-0"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}

        <Button
          variant="outline"
          className="size-8 p-0"
          onClick={() => onPageChange(page + 1)}
          disabled={!pagination.has_next_page}
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          className="size-8 p-0"
          onClick={() => onPageChange(total_pages)}
          disabled={page === total_pages}
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
