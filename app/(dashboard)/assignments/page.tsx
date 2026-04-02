"use client";

import { useEffect, useState } from "react";
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
import { deleteRequest, getRequests, type AssetRequest } from "@/lib/services/requests";

type AssignmentRow = {
  id: number;
  assetId: string;
  assetName: string;
  userName: string;
  assignedDate: string;
  status: "active" | "returned";
  notes: string;
};

function mapRequestToAssignmentRow(request: AssetRequest): AssignmentRow {
  const isReturned =
    request.type === "return" &&
    (request.status === "approved" || request.status === "completed");

  return {
    id: request.id,
    assetId: request.asset_id ? `AST-${request.asset_id}` : "—",
    assetName: request.asset_name ?? "Unknown Asset",
    userName: request.to_user_name ?? request.requested_by_name,
    assignedDate: request.created_at,
    status: isReturned ? "returned" : "active",
    notes: request.justification ?? request.reason,
  };
}

export default function AssignmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: number, event: React.MouseEvent) => {
    event.preventDefault();
    if (!confirm("Are you sure you want to delete this assignment request?")) return;

    try {
      await deleteRequest(id);
      setAssignments((prev) => prev.filter((assignment) => assignment.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete assignment");
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const requests = await getRequests();
        if (!isMounted) return;

        const assignmentRequests = requests
          .filter(
            (request) =>
              (request.type === "assign" || request.type === "return") &&
              request.status !== "draft" &&
              request.status !== "rejected" &&
              request.status !== "cancelled",
          )
          .map(mapRequestToAssignmentRow);

        setAssignments(assignmentRequests);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load assignments");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || assignment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (error) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: "Asset Management", href: "/assets" },
            { label: "Assignments" },
          ]}
        />
        <main className="flex-1 overflow-auto p-6">
          <p className="text-destructive">{error}</p>
        </main>
      </>
    );
  }

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
              <Link href="/requests/new?type=assign">
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
                    {loading
                      ? "Loading..."
                      : `${filteredAssignments.length} assignment${filteredAssignments.length !== 1 ? "s" : ""} found`}
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredAssignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No assignments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssignments.map((assignment) => (
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
                      <TableCell className="text-muted-foreground max-w-50 truncate">
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
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(event) => handleDelete(assignment.id, event)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
