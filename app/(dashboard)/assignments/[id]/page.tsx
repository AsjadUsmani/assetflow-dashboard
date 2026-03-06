"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  decideRequest,
  deleteRequest,
  getRequestById,
  type AssetRequest,
} from "@/lib/services/requests";

type AssignmentStatus = "active" | "returned";

function toAssignmentStatus(request: AssetRequest): AssignmentStatus {
  const isReturned =
    request.type === "return" &&
    (request.status === "approved" || request.status === "completed");
  return isReturned ? "returned" : "active";
}

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [request, setRequest] = useState<AssetRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(id)) {
      setError("Invalid assignment id");
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const data = await getRequestById(id);
        if (!mounted) return;
        if (!data || (data.type !== "assign" && data.type !== "return")) {
          setError("Assignment not found");
          return;
        }
        setRequest(data);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load assignment");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const assignmentStatus = request ? toAssignmentStatus(request) : "active";

  const userName = request?.to_user_name ?? request?.requested_by_name ?? "Unknown User";
  const userInitials = useMemo(
    () =>
      userName
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [userName],
  );

  const handleDelete = async () => {
    if (!request) return;
    if (!confirm("Are you sure you want to delete this assignment request?")) return;

    try {
      await deleteRequest(request.id);
      router.push("/assignments");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete assignment");
    }
  };

  const handleReturnAsset = async () => {
    if (!request) return;
    if (!confirm("Mark this assignment as returned?")) return;

    try {
      await decideRequest(request.id, {
        decision: "approve",
        comment: "Marked as returned from assignment detail page",
      });
      const refreshed = await getRequestById(request.id);
      if (refreshed) setRequest(refreshed);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to return asset");
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: "Asset Management", href: "/assets" },
            { label: "Assignments", href: "/assignments" },
            { label: "Loading" },
          ]}
        />
        <main className="flex-1 overflow-auto p-6">
          <p className="text-muted-foreground">Loading assignment...</p>
        </main>
      </>
    );
  }

  if (error || !request) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: "Asset Management", href: "/assets" },
            { label: "Assignments", href: "/assignments" },
          ]}
        />
        <main className="flex-1 overflow-auto p-6">
          <p className="text-destructive">{error ?? "Assignment not found"}</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/assignments">Back to Assignments</Link>
          </Button>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Asset Management", href: "/assets" },
          { label: "Assignments", href: "/assignments" },
          { label: request.asset_name ?? request.request_number },
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
                    <h1 className="text-2xl font-semibold tracking-tight">Assignment Details</h1>
                    {assignmentStatus === "active" ? (
                      <Badge
                        variant="outline"
                        className="bg-success/10 text-success border-success/30"
                      >
                        <CheckCircle2 className="mr-1 size-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">
                        <XCircle className="mr-1 size-3" />
                        Returned
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(request.asset_name ?? "Unknown Asset")} assigned to {userName}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href={`/assignments/${request.id}/edit`}>
                  <Edit className="mr-2 size-4" />
                  Edit
                </Link>
              </Button>
              {assignmentStatus === "active" && request.status === "pending" && (
                <Button variant="secondary" onClick={handleReturnAsset}>
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
                  <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
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
                    <p className="text-sm text-muted-foreground">
                      {request.asset_name ?? "Unknown Asset"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Request Number</p>
                    <p className="text-sm text-muted-foreground">{request.request_number}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Assigned Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.floor(
                        (Date.now() - new Date(request.created_at).getTime()) /
                          (1000 * 60 * 60 * 24),
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
                    <AvatarFallback className="bg-secondary text-lg">{userInitials || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{userName}</p>
                    <p className="text-sm text-muted-foreground">Assigned via request workflow</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Target User</p>
                    <p className="text-sm text-muted-foreground">{request.to_user_name ?? "Not specified"}</p>
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
              <p className="text-sm text-muted-foreground">{request.justification ?? request.reason ?? "No notes provided."}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
