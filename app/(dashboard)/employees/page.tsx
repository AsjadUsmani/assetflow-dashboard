"use client"

import * as React from "react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { ListPagination } from "@/components/list-pagination"
import {
  Users,
  Search,
  MoreHorizontal,
  UserPlus,
  Eye,
  Ban,
  FileDown,
  Upload,
  Download,
  ChevronDown,
  UserX,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/services/api-service"
import { useToast } from "@/components/ui/use-toast"
import { ImportCsvDialog } from "@/components/import-csv-dialog"
import { getEmployeesPage, type Employee } from "@/lib/services/employees"

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
  inactive: { label: "Inactive", color: "bg-secondary text-muted-foreground" },
}

function primaryName(row: Employee): string {
  const fromDisplay = row.display_name?.trim()
  if (fromDisplay) return fromDisplay
  return [row.first_name, row.last_name].filter(Boolean).join(" ").trim() || row.first_name
}

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
}

export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [importDialogOpen, setImportDialogOpen] = React.useState(false)
  const [actionEmployeeId, setActionEmployeeId] = React.useState<number | null>(null)
  const [page, setPage] = React.useState(1)
  const [pagination, setPagination] = React.useState<{
    page: number
    limit: number
    total: number
    total_pages: number
    has_next_page: boolean
    has_previous_page: boolean
  } | null>(null)
  const { toast } = useToast()

  const loadEmployees = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const rows = await getEmployeesPage({
        search: search.trim() || undefined,
        status: statusFilter === "all" ? undefined : (statusFilter as "active" | "inactive"),
        page,
        limit: 20,
      })
      setEmployees(rows.items)
      setPagination(rows.pagination)
    } catch {
      setEmployees([])
      setPagination(null)
    } finally {
      setIsLoading(false)
    }
  }, [page, search, statusFilter])

  React.useEffect(() => {
    void loadEmployees()
  }, [loadEmployees])

  React.useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  const handleDownloadSampleCsv = async () => {
    try {
      const blob = await apiService.getFile("/workspace/employees/sample-csv")
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "employees-sample.csv"
      a.click()
      URL.revokeObjectURL(url)
      toast({ title: "Download started", description: "employees-sample.csv" })
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: e instanceof Error ? e.message : "Unknown error",
      })
    }
  }

  const handleExportCsv = async () => {
    try {
      const blob = await apiService.getFile("/workspace/employees/export-csv")
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "employees-export.csv"
      a.click()
      URL.revokeObjectURL(url)
      toast({ title: "Export started", description: "employees-export.csv" })
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: e instanceof Error ? e.message : "Unknown error",
      })
    }
  }

  const handleToggleActive = async (row: Employee) => {
    setActionEmployeeId(row.id)
    try {
      await apiService.put(`/workspace/employees/${row.id}`, {
        is_active: !row.is_active,
      })
      toast({
        title: row.is_active ? "Employee deactivated" : "Employee activated",
        description: `${primaryName(row)} has been ${row.is_active ? "deactivated" : "activated"}.`,
      })
      await loadEmployees()
    } catch (e) {
      toast({
        variant: "destructive",
        title: row.is_active ? "Failed to deactivate" : "Failed to activate",
        description: e instanceof Error ? e.message : "Unknown error",
      })
    } finally {
      setActionEmployeeId(null)
    }
  }

  const activeCount = employees.filter((e) => e.is_active).length
  const inactiveCount = employees.length - activeCount

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Employee" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        {isLoading ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="size-4 rounded-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="mt-2 h-3 w-28" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-44" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-28" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="rounded-md border">
                  <div className="space-y-3 p-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="grid grid-cols-5 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pagination?.total ?? employees.length}</div>
                  <p className="text-xs text-muted-foreground">{activeCount} currently active on this page</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                  <UserX className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inactiveCount}</div>
                  <p className="text-xs text-muted-foreground">Directory records not active</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Employees</CardTitle>
                    <CardDescription>
                      {pagination?.total ?? employees.length} employee{(pagination?.total ?? employees.length) !== 1 ? "s" : ""} found (HR directory, no login)
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          CSV
                          <ChevronDown className="ml-2 size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleDownloadSampleCsv}>
                          <FileDown className="mr-2 size-4" />
                          Download sample CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                          <Upload className="mr-2 size-4" />
                          Import from CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportCsv}>
                          <Download className="mr-2 size-4" />
                          Export to CSV
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button asChild>
                      <Link href="/employees/create">
                        <UserPlus className="mr-2 size-4" />
                        Add Employee
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <ImportCsvDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                endpoint="/workspace/employees/import-csv"
                title="Import employees from CSV"
                description='Save Excel as CSV (UTF-8). Columns: username, email, department_name, designation_name, is_active (optional). Missing designations and departments are created automatically; same email updates the existing employee instead of duplicating.'
                sampleFilename="employees-sample.csv"
                onSuccess={loadEmployees}
              />
              <CardContent>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, department..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-37.5">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12.5" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map((row) => {
                        const statusKey = row.is_active ? "active" : "inactive"
                        const status = statusConfig[statusKey]
                        const name = primaryName(row)
                        const initials = initialsFromName(name)

                        return (
                          <TableRow key={row.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="size-9">
                                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{name}</div>
                                  <div className="text-xs text-muted-foreground">{row.email ?? "—"}</div>
                                  <div className="text-xs text-muted-foreground">{row.department_name ?? "—"}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {row.designation_name ?? "—"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={status.color}>
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => router.push(`/employees/${row.id}`)}>
                                    <Eye className="mr-2 size-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                      if (actionEmployeeId === row.id) return
                                      void handleToggleActive(row)
                                    }}
                                  >
                                    <Ban className="mr-2 size-4" />
                                    {actionEmployeeId === row.id
                                      ? "Updating..."
                                      : row.is_active
                                        ? "Deactivate"
                                        : "Activate"}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                <ListPagination
                  pagination={pagination}
                  label="employees"
                  onPageChange={setPage}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  )
}
