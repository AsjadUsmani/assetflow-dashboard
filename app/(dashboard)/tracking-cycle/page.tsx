"use client"

import { useEffect, useMemo, useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { getAssignmentHistory, type AssignmentHistoryEntry } from "@/lib/services/assets"

function displayName(value: string | null): string {
  return value?.trim() ? value : "—"
}

export default function TrackingCyclePage() {
  const [rows, setRows] = useState<AssignmentHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await getAssignmentHistory()
        if (mounted) setRows(data)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return rows
    return rows.filter((row) => {
      return (
        (row.asset_name ?? "").toLowerCase().includes(term) ||
        (row.assigned_to_user_name ?? "").toLowerCase().includes(term) ||
        (row.managed_by_user_name ?? "").toLowerCase().includes(term) ||
        (row.changed_by_user_name ?? "").toLowerCase().includes(term) ||
        (row.note ?? "").toLowerCase().includes(term)
      )
    })
  }, [rows, search])

  return (
    <>
      <AppHeader breadcrumbs={[{ label: "Home", href: "/" }, { label: "Tracking Cycle" }]} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Assignment Tracking Cycle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by asset, user, note..."
                className="pl-9"
              />
            </div>

            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading tracking history...</p>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tracking history found.</p>
              ) : (
                filtered.map((row) => (
                  <div key={row.id} className="rounded-md border border-border p-3">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">Asset: {displayName(row.asset_name)}</Badge>
                      <Badge variant="secondary">
                        {new Date(row.changed_at).toLocaleString()}
                      </Badge>
                    </div>
                    <div className="grid gap-1 text-sm sm:grid-cols-2">
                      <p>Assigned user: {displayName(row.previous_user_name)} → {displayName(row.assigned_to_user_name)}</p>
                      <p>Managed by: {displayName(row.previous_managed_by_user_name)} → {displayName(row.managed_by_user_name)}</p>
                      <p>Changed by: {displayName(row.changed_by_user_name)}</p>
                      <p>Note: {displayName(row.note)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

