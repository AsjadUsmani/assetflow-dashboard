import Link from "next/link";
import {
  UserCheck,
  Edit,
  Package,
  Calendar,
  User,
  ArrowLeft,
  MoreHorizontal,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
} from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const assignments = [
  {
    id: "asgn-1",
    assetId: "ast-001",
    assetName: "MacBook Pro 16\"",
    assetTag: "AST-2024-001",
    userId: "usr-002",
    userName: "Jane Smith",
    userEmail: "jane.smith@example.com",
    userDepartment: "Engineering",
    assignedDate: "2025-01-15",
    status: "active",
    notes: "Primary work laptop for development tasks",
  },
];

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assignment = assignments.find((a) => a.id === id) || assignments[0];

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Asset Management", href: "/assets" },
          { label: "Assignments", href: "/assignments" },
          { label: assignment.assetName },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/assignments">
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <UserCheck className="size-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight">
                      Assignment Details
                    </h1>
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
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {assignment.assetName} assigned to {assignment.userName}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href={`/assignments/${id}/edit`}>
                  <Edit className="mr-2 size-4" />
                  Edit
                </Link>
              </Button>
              {assignment.status === "active" && (
                <Button variant="secondary">
                  <XCircle className="mr-2 size-4" />
                  Return Asset
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 size-4" />
                    Delete Assignment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Asset Information</CardTitle>
                <CardDescription>Details about the assigned asset</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Package className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Asset Name</p>
                    <Link
                      href={`/assets/${assignment.assetId}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {assignment.assetName}
                    </Link>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Asset Tag</p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.assetTag}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Assigned Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(assignment.assignedDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.floor(
                        (Date.now() - new Date(assignment.assignedDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assigned User</CardTitle>
                <CardDescription>User who has this asset</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarFallback className="bg-secondary text-lg">
                      {assignment.userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      href={`/users/${assignment.userId}`}
                      className="font-medium hover:underline"
                    >
                      {assignment.userName}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {assignment.userEmail}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Department</p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.userDepartment}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Additional information about this assignment</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {assignment.notes || "No notes provided."}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
