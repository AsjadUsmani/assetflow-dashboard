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
  Calendar,
  Activity,
  FileDown,
  Upload,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
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
  first_name: string | null
  last_name: string | null
  role_name: string | null
  is_active: boolean
  last_login: string | null
}

export default function UsersPage() {
  const [users, setUsers] = React.useState<UserRow[]>([])
  const [search, setSearch] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [importDialogOpen, setImportDialogOpen] = React.useState(false)
  const { toast } = useToast()

  const loadUsers = React.useCallback(async () => {
    try {
      const res = await apiService.get<UserRow[]>("/workspace/users")
      if (res.data) setUsers(res.data)
    } catch {
      setUsers([])
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
      a.download = "users-sample.csv"
      a.click()
      URL.revokeObjectURL(url)
      toast({ title: "Download started", description: "users-sample.csv" })
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: e instanceof Error ? e.message : "Unknown error",
      })
    }
  }

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.username
    const matchesSearch =
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      (user.email ?? "").toLowerCase().includes(search.toLowerCase())
    const matchesRole =
      roleFilter === "all" ||
      (user.role_name ?? "").toLowerCase().replace(" ", "_") === roleFilter
    const status = user.is_active ? "active" : "inactive"
    const matchesStatus = statusFilter === "all" || status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const activeUsers = users.filter((u) => u.is_active).length
  const adminCount = users.filter((u) =>
    (u.role_name ?? "").toLowerCase().includes("admin"),
  ).length
  const roleOptions = React.useMemo(() => {
    const uniq = new Set<string>()
    for (const user of users) {
      const roleName = (user.role_name ?? "").trim()
      if (roleName) uniq.add(roleName)
    }
    return Array.from(uniq).sort((a, b) => a.localeCompare(b))
  }, [users])

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Users" },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Users online right now
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredUsers.length.toString()}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>
                {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
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
                <Link href="/users/create">
                  <UserPlus className="mr-2 size-4" />
                  Add User
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <ImportCsvDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          endpoint="/workspace/users/import-csv"
          title="Import users from CSV"
          description="Upload CSV with columns: Display name, Email Address, Title, Department, City, Country, Office, Block Credentials. Download sample CSV for exact format."
          sampleFilename="users-sample.csv"
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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <Shield className="mr-2 size-4" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roleOptions.map((roleName) => (
                  <SelectItem
                    key={roleName}
                    value={roleName.toLowerCase().replace(/\s+/g, "_")}
                  >
                    {roleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
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
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-[50px]" />
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
                  const fullName =
                    `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
                    user.username
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
                      <TableCell className="text-muted-foreground">
                        {user.last_login
                          ? new Date(user.last_login).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 size-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/users/${user.id}/edit`}>
                                <Edit className="mr-2 size-4" />
                                Edit User
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
                            <DropdownMenuItem className="text-destructive">
                              <Ban className="mr-2 size-4" />
                              Suspend User
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
    </div>
  )
}
