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
import {
  Users,
  Search,
  MoreHorizontal,
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Edit,
  Eye,
  Key,
  Ban,
  Mail,
  FileDown,
  Upload,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/services/api-service"
import { useToast } from "@/components/ui/use-toast"
import { ImportCsvDialog } from "@/components/import-csv-dialog"

const roleConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  super_admin: {
    label: "Super Admin",
    color: "bg-red-500/10 text-red-600 dark:text-red-400",
    icon: ShieldAlert,
  },
  admin: {
    label: "Admin",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    icon: ShieldCheck,
  },
  manager: {
    label: "Manager",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    icon: Shield,
  },
  editor: {
    label: "Editor",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
    icon: Shield,
  },
  viewer: {
    label: "Viewer",
    color: "bg-secondary text-secondary-foreground",
    icon: Shield,
  },
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
  inactive: { label: "Inactive", color: "bg-secondary text-muted-foreground" },
  suspended: { label: "Suspended", color: "bg-red-500/10 text-red-600 dark:text-red-400" },
}

const fallbackRoleBadge = {
  color: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
}

type UserRow = {
  id: number
  username: string
  email: string | null
  role_name: string | null
  department_name: string | null
  country_id: number | null
  country_name: string | null
  city: string | null
  office: string | null
  is_active: boolean
  last_login: string | null
}

function isEmployeeRole(roleName: string | null): boolean {
  return (roleName ?? "").trim().toLowerCase() === "employee"
}

export default function EmployeesPage() {
  const router = useRouter()
  const [users, setUsers] = React.useState<UserRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [importDialogOpen, setImportDialogOpen] = React.useState(false)
  const [actionUserId, setActionUserId] = React.useState<number | null>(null)
  const { toast } = useToast()

  const loadUsers = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await apiService.get<UserRow[]>("/workspace/users")
      if (res.data) setUsers(res.data)
    } catch {
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const handleDownloadSampleCsv = async () => {
    try {
      const blob = await apiService.getFile("/workspace/users/sample-csv")
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

  const handleToggleSuspend = async (user: UserRow) => {
    setActionUserId(user.id)
    try {
      await apiService.put(`/workspace/users/${user.id}`, {
        is_active: !user.is_active,
      })
      toast({
        title: user.is_active ? "Employee suspended" : "Employee activated",
        description: `${user.username} has been ${user.is_active ? "suspended" : "activated"}.`,
      })
      await loadUsers()
    } catch (e) {
      toast({
        variant: "destructive",
        title: user.is_active ? "Failed to suspend employee" : "Failed to activate employee",
        description: e instanceof Error ? e.message : "Unknown error",
      })
    } finally {
      setActionUserId(null)
    }
  }

  const employeeUsers = React.useMemo(
    () => users.filter((user) => isEmployeeRole(user.role_name)),
    [users],
  )

  const filteredUsers = employeeUsers.filter((user) => {
    const fullName = user.username || user.email || ""
    const matchesSearch =
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      (user.email ?? "").toLowerCase().includes(search.toLowerCase())
    const status = user.is_active ? "active" : "inactive"
    const matchesStatus = statusFilter === "all" || status === statusFilter
    return matchesSearch && matchesStatus
  })

  const activeUsers = employeeUsers.filter((u) => u.is_active).length
  const adminCount = employeeUsers.filter((u) =>
    (u.role_name ?? "").toLowerCase().includes("admin"),
  ).length
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
              {Array.from({ length: 4 }).map((_, index) => (
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
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{employeeUsers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeUsers} currently active
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                  <ShieldCheck className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminCount}</div>
                  <p className="text-xs text-muted-foreground">
                    With elevated permissions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Employee List */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Employees</CardTitle>
                    <CardDescription>
                      {filteredUsers.length} employee{filteredUsers.length !== 1 ? "s" : ""} found
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
                endpoint="/workspace/users/import-csv"
                title="Import employees from CSV"
                description="Upload CSV with columns: Display name, Email Address, Title, Department, City, Country, Office, Block Credentials. Download sample CSV for exact format."
                sampleFilename="employees-sample.csv"
                onSuccess={loadUsers}
              />
              <CardContent>
                {/* Filters */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
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
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12.5" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => {
                  const roleKey = (user.role_name ?? "")
                    .toLowerCase()
                    .replace(/\s+/g, "_")
                  const role = roleConfig[roleKey]
                  const statusKey = user.is_active ? "active" : "inactive"
                  const status = statusConfig[statusKey]
                  const fullName = user.username || user.email || ""
                  const initials = fullName
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join("")

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            <AvatarFallback className="text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{fullName}</div>
                            <div className="text-xs text-muted-foreground">
                              {user.email ?? "—"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.department_name ?? "—"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={role?.color ?? fallbackRoleBadge.color}>
                          {role?.label ?? user.role_name ?? "Unassigned"}
                        </Badge>
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
                            <DropdownMenuItem
                              onClick={() => router.push(`/employees/${user.id}`)}
                            >
                              <Eye className="mr-2 size-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/users/${user.id}/edit`}>
                                <Edit className="mr-2 size-4" />
                                Edit Employee
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Key className="mr-2 size-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 size-4" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                if (actionUserId === user.id) return
                                void handleToggleSuspend(user)
                              }}
                            >
                              <Ban className="mr-2 size-4" />
                              {actionUserId === user.id
                                ? "Updating..."
                                : user.is_active
                                  ? "Suspend Employee"
                                  : "Activate Employee"}
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
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  )
}
