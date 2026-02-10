"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Package,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const assignments = [
  {
    id: "asgn-1",
    assetId: "ast-001",
    assetName: "MacBook Pro 16\"",
    userId: "usr-002",
    userName: "Jane Smith",
    assignedDate: "2025-01-15",
    status: "active",
    notes: "Primary work laptop",
  },
  {
    id: "asgn-2",
    assetId: "ast-003",
    assetName: "Dell Monitor 27\"",
    userId: "usr-003",
    userName: "Mike Johnson",
    assignedDate: "2025-01-10",
    status: "active",
    notes: "Dual monitor setup",
  },
  {
    id: "asgn-3",
    assetId: "ast-005",
    assetName: "Cisco IP Phone",
    userId: "usr-004",
    userName: "Sarah Williams",
    assignedDate: "2024-12-20",
    status: "returned",
    returnedDate: "2025-01-25",
    notes: "Office phone",
  },
  {
    id: "asgn-4",
    assetId: "ast-007",
    assetName: "Standing Desk",
    userId: "usr-002",
    userName: "Jane Smith",
    assignedDate: "2025-01-05",
    status: "active",
    notes: "Ergonomic workstation",
  },
];

export default function AssignmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || assignment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Asset Management", href: "/assets" },
          { label: "Assignments" },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Asset Assignments
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage asset assignments to users
              </p>
            </div>
            <Button asChild>
              <Link href="/assignments/new">
                <Plus className="mr-2 size-4" />
                New Assignment
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base">All Assignments</CardTitle>
                  <CardDescription>
                    {filteredAssignments.length} assignment
                    {filteredAssignments.length !== 1 ? "s" : ""} found
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Search assignments..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <Link
                          href={`/assignments/${assignment.id}`}
                          className="flex items-center gap-3 hover:underline"
                        >
                          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                            <Package className="size-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{assignment.assetName}</p>
                            <p className="text-xs text-muted-foreground">
                              ID: {assignment.assetId}
                            </p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7">
                            <AvatarFallback className="text-xs bg-secondary">
                              {assignment.userName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span>{assignment.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {new Date(assignment.assignedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {assignment.status === "active" ? (
                          <Badge
                            variant="outline"
                            className="bg-success/10 text-success border-success/30"
                          >
                            <CheckCircle2 className="mr-1 size-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-muted text-muted-foreground"
                          >
                            <XCircle className="mr-1 size-3" />
                            Returned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">
                        {assignment.notes}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/assignments/${assignment.id}`}>
                                <Eye className="mr-2 size-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/assignments/${assignment.id}/edit`}>
                                <Edit className="mr-2 size-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            {assignment.status === "active" && (
                              <DropdownMenuItem>
                                <XCircle className="mr-2 size-4" />
                                Return Asset
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
