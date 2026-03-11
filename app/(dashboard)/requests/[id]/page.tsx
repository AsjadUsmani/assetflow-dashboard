"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  Calendar,
} from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getRequestById, decideRequest, type AssetRequest } from "@/lib/services/requests";

const statusConfig = {
  draft: { label: "Draft", icon: FileText, color: "bg-muted text-muted-foreground" },
  pending: { label: "Pending", icon: Clock, color: "bg-amber-500/20 text-amber-400" },
  in_review: { label: "In Review", icon: AlertCircle, color: "bg-blue-500/20 text-blue-400" },
  approved: { label: "Approved", icon: CheckCircle, color: "bg-green-500/20 text-green-400" },
  rejected: { label: "Rejected", icon: XCircle, color: "bg-red-500/20 text-red-400" },
  completed: { label: "Completed", icon: CheckCircle, color: "bg-primary/20 text-primary" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-muted text-muted-foreground" },
};

const typeConfig = {
  create: { label: "Create Asset", color: "bg-primary/20 text-primary" },
  assign: { label: "Asset Assignment", color: "bg-blue-500/20 text-blue-400" },
  transfer: { label: "Asset Transfer", color: "bg-purple-500/20 text-purple-400" },
  dispose: { label: "Asset Disposal", color: "bg-red-500/20 text-red-400" },
  buyback: { label: "Asset Buyback", color: "bg-amber-500/20 text-amber-400" },
  maintenance: { label: "Maintenance Request", color: "bg-orange-500/20 text-orange-400" },
  return: { label: "Asset Return", color: "bg-green-500/20 text-green-400" },
};

const defaultStatusConfig = {
  label: "Unknown",
  icon: AlertCircle,
  color: "bg-muted text-muted-foreground",
};

const defaultTypeConfig = {
  label: "Unknown",
  color: "bg-muted text-muted-foreground",
};

function isStatusKey(value: string): value is keyof typeof statusConfig {
  return value in statusConfig;
}

function isTypeKey(value: string): value is keyof typeof typeConfig {
  return value in typeConfig;
}

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [comments, setComments] = useState("");
  const [request, setRequest] = useState<AssetRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const numericId = Number(params.id);

  useEffect(() => {
    if (Number.isNaN(numericId)) {
      setError("Invalid request id");
      setLoading(false);
      return;
    }
    let isMounted = true;
    (async () => {
      try {
        const data = await getRequestById(numericId);
        if (!isMounted) return;
        if (!data) {
          setError("Request not found");
        } else {
          setRequest(data);
        }
      } catch {
        if (!isMounted) return;
        setError("Failed to load request");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [numericId]);

  if (loading) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Requests", href: "/requests" },
            { label: "Loading" },
          ]}
        />
        <div className="flex flex-1 items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Loading request...</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!request || error) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Requests", href: "/requests" },
            { label: "Not Found" },
          ]}
        />
        <div className="flex flex-1 items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="mx-auto size-12 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">Request Not Found</h2>
              <p className="mt-2 text-muted-foreground">
                {error || "The request you are looking for does not exist."}
              </p>
              <Button className="mt-4" asChild>
                <Link href="/requests">Back to Requests</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const status = isStatusKey(request.status)
    ? statusConfig[request.status]
    : defaultStatusConfig;
  const type = isTypeKey(request.type)
    ? typeConfig[request.type]
    : defaultTypeConfig;
  const StatusIcon = status.icon;

  const approvalLevelLabel =
    request.current_approval_level === "location"
      ? "Location HOD / Local Approver"
      : request.current_approval_level === "ho"
      ? "Head Office Admin"
      : request.current_approval_level === "completed"
      ? "Completed"
      : request.current_approval_level === "rejected"
      ? "Rejected"
      : request.current_approval_level || "Not started";

  const assetName = request.asset_name ?? "Asset";
  const requestedByName = request.requested_by_name;

  const canApprove = request.status === "pending" || request.status === "in_review";

  const handleApprove = async () => {
    try {
      const updated = await decideRequest(request.id, { decision: "approve", comment: comments });
      setRequest(updated);
      setApproveDialogOpen(false);
      setComments("");
    } catch {
      setApproveDialogOpen(false);
    }
  };

  const handleReject = async () => {
    try {
      const updated = await decideRequest(request.id, { decision: "reject", comment: comments });
      setRequest(updated);
      setRejectDialogOpen(false);
      setComments("");
    } catch {
      setRejectDialogOpen(false);
    }
  };

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Requests", href: "/requests" },
          { label: request.request_number },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/requests">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {request.request_number}
              </h1>
              <Badge variant="outline" className={type.color}>
                {type.label}
              </Badge>
              <Badge variant="outline" className={status.color}>
                <StatusIcon className="mr-1 size-3" />
                {status.label}
              </Badge>
            </div>
            <p className="mt-1 text-muted-foreground">{request.reason}</p>
          </div>
          {canApprove && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                onClick={() => setRejectDialogOpen(true)}
              >
                <XCircle className="mr-2 size-4" />
                Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setApproveDialogOpen(true)}
              >
                <CheckCircle className="mr-2 size-4" />
                Approve
              </Button>
            </div>
          )}
        </div>

        {/* Pending Approval Alert */}
        {canApprove && (
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <AlertCircle className="size-4 text-amber-400" />
            <AlertTitle className="text-amber-400">Approval Required</AlertTitle>
            <AlertDescription>
              This request is waiting for approval. Use the buttons above to approve or reject.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Asset Details */}
            <Card>
              <CardHeader>
                <CardTitle>Asset Details</CardTitle>
                <CardDescription>
                  Information about the asset in this request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {assetName ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Asset Name</p>
                      <p className="font-medium">{assetName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <Badge variant="outline" className="mt-1 capitalize">
                        {request.type}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No asset details available</p>
                )}
              </CardContent>
            </Card>

            {/* Justification */}
            {request.justification && (
              <Card>
                <CardHeader>
                  <CardTitle>Justification</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{request.justification}</p>
                </CardContent>
              </Card>
            )}

            {/* Decision comment (from approver) */}
            {request.decision_comment && (
              <Card>
                <CardHeader>
                  <CardTitle>Decision Comment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{request.decision_comment}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Request Info */}
            <Card>
              <CardHeader>
                <CardTitle>Request Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Requested By</p>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="size-4 text-muted-foreground" />
                    <span className="font-medium">{requestedByName || "Unknown"}</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Request Date</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span className="font-medium">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <Badge variant="outline" className="mt-1 capitalize">
                    {request.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Simple approval status summary */}
            <Card>
              <CardHeader>
                <CardTitle>Approval Status</CardTitle>
                <CardDescription>Current state of this request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <StatusIcon className="size-4 text-muted-foreground" />
                  <span className="font-medium capitalize">{request.status}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Level: <span className="font-medium">{approvalLevelLabel}</span>
                </div>
                {request.decided_at && (
                  <div className="text-sm text-muted-foreground">
                    Decided at {new Date(request.decided_at).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this request? This action will move the
              request to the next approval stage.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Comments (Optional)</label>
              <Textarea
                placeholder="Add any comments for the approval..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this request? Please provide a reason for
              the rejection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Rejection Reason <span className="text-red-400">*</span>
              </label>
              <Textarea
                placeholder="Please explain why this request is being rejected..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="mt-2"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!comments.trim()}
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
