"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  UserCircle,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Eye,
  History,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { assets, users } from "@/lib/mock-data";

const mockAssets = assets;
const mockUsers = users;

// Group assets by assigned user
const assignmentsByUser = mockUsers.map((user) => {
  const userAssets = mockAssets.filter(
    (asset) => asset.assignedTo === user.name
  );
  const overdueAssets = userAssets.filter(
    (asset) =>
      asset.warrantyExpiry && new Date(asset.warrantyExpiry) < new Date()
  );

  return {
    user,
    assets: userAssets,
    totalValue: userAssets.reduce((sum, asset) => sum + (asset.value || 0), 0),
    overdueCount: overdueAssets.length,
  };
});

const unassignedAssets = mockAssets.filter((asset) => !asset.assignedTo);

export function AccountabilityList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const filteredAssignments = assignmentsByUser.filter((assignment) => {
    const matchesSearch =
      assignment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" ||
      assignment.user.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assignments
            </CardTitle>
            <UserCircle className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignmentsByUser.filter((a) => a.assets.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Users with assets</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assigned Assets
            </CardTitle>
            <Package className="size-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAssets.filter((a) => a.assignedTo).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {mockAssets.length} total
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unassigned
            </CardTitle>
            <AlertTriangle className="size-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unassignedAssets.length}</div>
            <p className="text-xs text-muted-foreground">Require assignment</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Returns
            </CardTitle>
            <Clock className="size-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Overdue checkouts</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-secondary border-0"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-48 bg-secondary border-0">
              <Filter className="mr-2 size-4" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="by-user" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="by-user">By User</TabsTrigger>
          <TabsTrigger value="unassigned">Unassigned Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="by-user" className="space-y-4">
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>User</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Assets Count</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments
                  .filter((a) => a.assets.length > 0)
                  .map((assignment) => (
                    <TableRow
                      key={assignment.user.id}
                      className="border-border hover:bg-secondary/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-primary/20 text-primary text-xs">
                              {assignment.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {assignment.user.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {assignment.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-secondary/50">
                          {assignment.user.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {assignment.assets.length}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          ${assignment.totalValue.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {assignment.overdueCount > 0 ? (
                          <Badge
                            variant="outline"
                            className="bg-warning/20 text-warning border-warning/30"
                          >
                            <AlertTriangle className="mr-1 size-3" />
                            {assignment.overdueCount} Overdue
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-success/20 text-success border-success/30"
                          >
                            <CheckCircle className="mr-1 size-3" />
                            Good Standing
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 size-4" />
                              View Assets
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <History className="mr-2 size-4" />
                              Assignment History
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="unassigned" className="space-y-4">
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedAssets.map((asset) => (
                  <TableRow
                    key={asset.id}
                    className="border-border hover:bg-secondary/50"
                  >
                    <TableCell>
                      <div className="font-medium">{asset.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {asset.assetTag}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-secondary/50">
                        {asset.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{asset.location}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          asset.status === "available"
                            ? "bg-success/20 text-success border-success/30"
                            : "bg-warning/20 text-warning border-warning/30"
                        }
                      >
                        {asset.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      ${asset.value?.toLocaleString() || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
