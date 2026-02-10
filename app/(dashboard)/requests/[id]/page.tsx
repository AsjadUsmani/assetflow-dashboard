"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Download,
  User,
  MapPin,
  Building,
  Calendar,
  MessageSquare,
  ChevronRight,
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { assetRequests, assets, users, locations, departments } from "@/lib/mock-data";
import { currentUser } from "@/lib/mock-data";

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

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [comments, setComments] = useState("");

  const request = assetRequests.find((r) => r.id === params.id);

  if (!request) {
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
                The request you are looking for does not exist.
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

  const status = statusConfig[request.status];
  const type = typeConfig[request.type];
  const StatusIcon = status.icon;

  const asset = request.assetId ? assets.find((a) => a.id === request.assetId) : null;
  const requester = users.find((u) => u.id === request.requestedBy);
  const fromLocation = request.fromLocationId
    ? locations.find((l) => l.id === request.fromLocationId)
    : null;
  const toLocation = request.toLocationId
    ? locations.find((l) => l.id === request.toLocationId)
    : null;
  const fromDepartment = request.fromDepartmentId
    ? departments.find((d) => d.id === request.fromDepartmentId)
    : null;
  const toDepartment = request.toDepartmentId
    ? departments.find((d) => d.id === request.toDepartmentId)
    : null;
  const toUser = request.toUserId ? users.find((u) => u.id === request.toUserId) : null;

  // Check if current user can approve
  const pendingStep = request.approvalChain.find((step) => step.status === "pending");
  const canApprove =
    pendingStep &&
    (pendingStep.approverId === currentUser.id ||
      currentUser.role === "super_admin" ||
      currentUser.role === "ho_admin");

  const handleApprove = () => {
    // In real app, this would call an API
    setApproveDialogOpen(false);
    setComments("");
  };

  const handleReject = () => {
    // In real app, this would call an API
    setRejectDialogOpen(false);
    setComments("");
  };

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Requests", href: "/requests" },
          { label: request.requestNumber },
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
                {request.requestNumber}
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
        {pendingStep && canApprove && (
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <AlertCircle className="size-4 text-amber-400" />
            <AlertTitle className="text-amber-400">Approval Required</AlertTitle>
            <AlertDescription>
              This request is waiting for your approval at the{" "}
              <span className="font-semibold capitalize">{pendingStep.level}</span> level.
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
                {asset ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Asset Name</p>
                      <p className="font-medium">{asset.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Serial Number</p>
                      <p className="font-medium">{asset.serialNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <Badge variant="outline" className="mt-1 capitalize">
                        {asset.category}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant="outline" className="mt-1 capitalize">
                        {asset.status}
                      </Badge>
                    </div>
                  </div>
                ) : request.assetDetails ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Asset Name</p>
                      <p className="font-medium">{request.assetDetails.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Serial Number</p>
                      <p className="font-medium">
                        {request.assetDetails.serialNumber || "To be assigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <Badge variant="outline" className="mt-1 capitalize">
                        {request.assetDetails.category}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No asset details available</p>
                )}
              </CardContent>
            </Card>

            {/* Transfer Details */}
            {(request.type === "transfer" ||
              request.type === "assign" ||
              request.type === "return") && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {request.type === "transfer" ? "Transfer" : "Assignment"} Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {/* From */}
                    <div className="flex-1 rounded-lg border border-dashed p-4">
                      <p className="text-sm font-medium text-muted-foreground">From</p>
                      <div className="mt-2 space-y-2">
                        {fromLocation && (
                          <div className="flex items-center gap-2">
                            <MapPin className="size-4 text-muted-foreground" />
                            <span>{fromLocation.name}</span>
                          </div>
                        )}
                        {fromDepartment && (
                          <div className="flex items-center gap-2">
                            <Building className="size-4 text-muted-foreground" />
                            <span>{fromDepartment.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="size-6 text-muted-foreground" />

                    {/* To */}
                    <div className="flex-1 rounded-lg border border-primary/50 bg-primary/5 p-4">
                      <p className="text-sm font-medium text-primary">To</p>
                      <div className="mt-2 space-y-2">
                        {toLocation && (
                          <div className="flex items-center gap-2">
                            <MapPin className="size-4 text-primary" />
                            <span>{toLocation.name}</span>
                          </div>
                        )}
                        {toDepartment && (
                          <div className="flex items-center gap-2">
                            <Building className="size-4 text-primary" />
                            <span>{toDepartment.name}</span>
                          </div>
                        )}
                        {toUser && (
                          <div className="flex items-center gap-2">
                            <User className="size-4 text-primary" />
                            <span>{toUser.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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

            {/* Documents */}
            {request.documents && request.documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Supporting Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {request.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="size-5 text-muted-foreground" />
                          <span>{doc}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
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
                    <span className="font-medium">{requester?.name || "Unknown"}</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Request Date</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span className="font-medium">
                      {request.requestedAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <Badge
                    variant="outline"
                    className={`mt-1 capitalize ${
                      request.priority === "urgent"
                        ? "border-red-500/50 text-red-400"
                        : request.priority === "high"
                          ? "border-amber-500/50 text-amber-400"
                          : ""
                    }`}
                  >
                    {request.priority}
                  </Badge>
                </div>
                {request.requiresAcknowledgement && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Acknowledgement</p>
                      <Badge
                        variant="outline"
                        className={`mt-1 ${
                          request.acknowledgedAt
                            ? "bg-green-500/20 text-green-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {request.acknowledgedAt ? "Acknowledged" : "Pending"}
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Approval Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Approval Timeline</CardTitle>
                <CardDescription>Track the approval progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-4">
                  {request.approvalChain.map((step, index) => {
                    const isLast = index === request.approvalChain.length - 1;
                    const isPending = step.status === "pending";
                    const isApproved = step.status === "approved";
                    const isRejected = step.status === "rejected";

                    return (
                      <div key={index} className="relative flex gap-4">
                        {/* Line */}
                        {!isLast && (
                          <div
                            className={`absolute left-3 top-8 h-full w-0.5 ${
                              isApproved ? "bg-green-500" : "bg-border"
                            }`}
                          />
                        )}

                        {/* Icon */}
                        <div
                          className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full ${
                            isApproved
                              ? "bg-green-500"
                              : isRejected
                                ? "bg-red-500"
                                : isPending
                                  ? "bg-amber-500"
                                  : "bg-muted"
                          }`}
                        >
                          {isApproved ? (
                            <CheckCircle className="size-4 text-white" />
                          ) : isRejected ? (
                            <XCircle className="size-4 text-white" />
                          ) : (
                            <Clock className="size-3 text-white" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <p className="font-medium capitalize">{step.level} Level</p>
                            {step.actionAt && (
                              <span className="text-xs text-muted-foreground">
                                {step.actionAt.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {step.approverName}
                          </p>
                          {step.comments && (
                            <div className="mt-2 flex items-start gap-2 rounded-md bg-muted/50 p-2">
                              <MessageSquare className="mt-0.5 size-3 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                {step.comments}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
