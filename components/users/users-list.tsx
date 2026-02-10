"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Shield,
  Mail,
  UserCheck,
  UserX,
  ChevronRight,
  Users,
  GitBranch,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { users, locations, departments, regions } from "@/lib/mock-data";

// Role display configuration
const roleConfig = {
  super_admin: {
    label: "Super Admin",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    level: 1,
  },
  ho_admin: {
    label: "HO Admin",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    level: 2,
  },
  regional_admin: {
    label: "Regional Admin",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    level: 3,
  },
  location_hod: {
    label: "Location HOD",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    level: 4,
  },
  reporting_person: {
    label: "Reporting Person",
    color: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    level: 5,
  },
  cinema_user: {
    label: "Cinema User",
    color: "bg-muted text-muted-foreground border-border",
    level: 6,
  },
};

export function UsersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "hierarchy">("table");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesLocation =
      locationFilter === "all" || user.locationId === locationFilter;
    return matchesSearch && matchesRole && matchesLocation;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };

  const getLocationName = (locationId?: string) => {
    if (!locationId) return "—";
    const location = locations.find((l) => l.id === locationId);
    return location?.name || "—";
  };

  const getDepartmentName = (departmentId?: string) => {
    if (!departmentId) return "—";
    const department = departments.find((d) => d.id === departmentId);
    return department?.name || "—";
  };

  const getRegionName = (regionId?: string) => {
    if (!regionId) return "—";
    const region = regions.find((r) => r.id === regionId);
    return region?.name || "—";
  };

  const getReportsTo = (reportsToId?: string) => {
    if (!reportsToId) return null;
    return users.find((u) => u.id === reportsToId);
  };

  const getApprovalChain = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user?.approverIds) return [];
    return user.approverIds
      .map((id) => users.find((u) => u.id === id))
      .filter(Boolean);
  };

  // Group users by role for hierarchy view
  const usersByRole = Object.entries(roleConfig)
    .sort((a, b) => a[1].level - b[1].level)
    .map(([role, config]) => ({
      role,
      config,
      users: users.filter((u) => u.role === role),
    }))
    .filter((group) => group.users.length > 0);

  const approvers = users.filter(
    (u) => u.canApproveTransfers || u.canApproveDisposals
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all locations
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approvers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{approvers}</div>
            <p className="text-xs text-muted-foreground">
              Can approve requests
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Regions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">
              {regions.length}
            </div>
            <p className="text-xs text-muted-foreground">With regional admins</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
            <p className="text-xs text-muted-foreground">With assigned users</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-secondary border-0"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40 bg-secondary border-0">
              <Filter className="mr-2 size-4" />
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {Object.entries(roleConfig).map(([role, config]) => (
                <SelectItem key={role} value={role}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-40 bg-secondary border-0">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-1 rounded-lg bg-secondary p-1">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <Users className="size-4" />
            </Button>
            <Button
              variant={viewMode === "hierarchy" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("hierarchy")}
            >
              <GitBranch className="size-4" />
            </Button>
          </div>
        </div>
        <Button asChild>
          <Link href="/users/new">
            <Plus className="mr-2 size-4" />
            Add User
          </Link>
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
          <span className="text-sm font-medium">
            {selectedUsers.length} users selected
          </span>
          <Button variant="outline" size="sm">
            <Mail className="mr-2 size-4" />
            Send Email
          </Button>
          <Button variant="outline" size="sm">
            <Shield className="mr-2 size-4" />
            Change Role
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive bg-transparent"
          >
            <UserX className="mr-2 size-4" />
            Deactivate
          </Button>
        </div>
      )}

      {/* Hierarchy View */}
      {viewMode === "hierarchy" && (
        <div className="space-y-4">
          {usersByRole.map((group) => (
            <Card key={group.role} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={group.config.color}>
                    {group.config.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {group.users.length} user
                    {group.users.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {group.users.map((user) => {
                    const reportsTo = getReportsTo(user.reportsToId);
                    return (
                      <Link
                        key={user.id}
                        href={`/users/${user.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                      >
                        <Avatar className="size-10">
                          <AvatarFallback className="bg-primary/20 text-primary text-sm">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{user.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {user.regionId
                              ? getRegionName(user.regionId)
                              : getLocationName(user.locationId)}
                          </div>
                          {reportsTo && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <ChevronRight className="size-3" />
                              Reports to {reportsTo.name}
                            </div>
                          )}
                        </div>
                        {(user.canApproveTransfers || user.canApproveDisposals) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Shield className="size-4 text-primary" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Can approve:{" "}
                                  {[
                                    user.canApproveTransfers && "Transfers",
                                    user.canApproveDisposals && "Disposals",
                                    user.canApproveBuybacks && "Buybacks",
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedUsers.length === filteredUsers.length &&
                      filteredUsers.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Reports To</TableHead>
                <TableHead>Location / Region</TableHead>
                <TableHead>Approval Rights</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const reportsTo = getReportsTo(user.reportsToId);
                const approvalChain = getApprovalChain(user.id);
                const roleInfo = roleConfig[user.role as keyof typeof roleConfig];

                return (
                  <TableRow
                    key={user.id}
                    className="border-border hover:bg-secondary/50"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) =>
                          handleSelectUser(user.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/users/${user.id}`}
                        className="flex items-center gap-3 hover:underline"
                      >
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleInfo?.color}>
                        {roleInfo?.label || user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {reportsTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="text-[10px] bg-secondary">
                              {reportsTo.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{reportsTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.regionId ? (
                          <span className="text-amber-400">
                            {getRegionName(user.regionId)}
                          </span>
                        ) : (
                          getLocationName(user.locationId)
                        )}
                      </div>
                      {user.departmentId && (
                        <div className="text-xs text-muted-foreground">
                          {getDepartmentName(user.departmentId)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.canApproveTransfers && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-blue-500/20 text-blue-400 border-blue-500/30"
                          >
                            Transfer
                          </Badge>
                        )}
                        {user.canApproveDisposals && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-red-500/20 text-red-400 border-red-500/30"
                          >
                            Disposal
                          </Badge>
                        )}
                        {user.canApproveBuybacks && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30"
                          >
                            Buyback
                          </Badge>
                        )}
                        {!user.canApproveTransfers &&
                          !user.canApproveDisposals &&
                          !user.canApproveBuybacks && (
                            <span className="text-xs text-muted-foreground">
                              None
                            </span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/users/${user.id}`}>
                              <Eye className="mr-2 size-4" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/users/${user.id}/edit`}>
                              <Edit className="mr-2 size-4" />
                              Edit User
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="mr-2 size-4" />
                            Manage Permissions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 size-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
