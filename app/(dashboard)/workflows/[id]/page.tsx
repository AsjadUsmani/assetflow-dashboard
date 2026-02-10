"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRightLeft,
  Trash2,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  MapPin,
  User,
  FileText,
  Upload,
  Download,
  MessageSquare,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { workflowRequests, assets, users } from "@/lib/mock-data";

const getRequestIcon = (type: string) => {
  switch (type) {
    case "transfer":
      return ArrowRightLeft;
    case "disposal":
      return Trash2;
    case "buyback":
      return DollarSign;
    default:
      return ArrowRightLeft;
  }
};

const getStageInfo = (stage: string) => {
  switch (stage) {
    case "cinema":
      return { label: "Cinema Review", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Building2 };
    case "regional":
      return { label: "Regional Team", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: MapPin };
    case "ho":
      return { label: "Head Office", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Building2 };
    case "completed":
      return { label: "Completed", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2 };
    case "rejected":
      return { label: "Rejected", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle };
    default:
      return { label: stage, color: "bg-secondary text-muted-foreground", icon: Clock };
  }
};

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const workflow = workflowRequests.find((w) => w.id === workflowId);

  if (!workflow) {
    return (
      <>
        <AppHeader breadcrumbs={[{ label: "Workflows", href: "/workflows" }, { label: "Not Found" }]} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <h1 className="text-xl font-semibold">Workflow not found</h1>
          <Button asChild>
            <Link href="/workflows">Back to Workflows</Link>
          </Button>
        </div>
      </>
    );
  }

  const Icon = getRequestIcon(workflow.requestType);
  const asset = assets.find((a) => a.id === workflow.assetId);
  const requester = users.find((u) => u.id === workflow.requestedBy);
  const stageInfo = getStageInfo(workflow.currentStage);
  const stages = ["cinema", "regional", "ho"];

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Workflows", href: "/workflows" },
          { label: `${workflow.requestType.charAt(0).toUpperCase() + workflow.requestType.slice(1)} Request` },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex size-12 items-center justify-center rounded-xl bg-secondary">
              <Icon className="size-6 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">
                  {workflow.requestType.charAt(0).toUpperCase() + workflow.requestType.slice(1)} Request
                </h1>
                <Badge variant="outline" className={stageInfo.color}>
                  {stageInfo.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {asset?.name} - {asset?.serialNumber || "No serial number"}
              </p>
            </div>
          </div>

          {workflow.currentStage !== "completed" && workflow.currentStage !== "rejected" && (
            <div className="flex gap-2">
              <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10 bg-transparent">
                <XCircle className="mr-2 size-4" />
                Reject
              </Button>
              <Button>
                <CheckCircle2 className="mr-2 size-4" />
                Approve
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Approval Pipeline */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Approval Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {stages.map((stage, index) => {
                    const step = workflow.approvalHistory.find((s) => s.stage === stage);
                    const isActive = workflow.currentStage === stage;
                    const isCompleted = step?.status === "approved";
                    const isRejected = step?.status === "rejected";
                    const approver = step?.approvedBy ? users.find((u) => u.id === step.approvedBy) : null;
                    const StageIcon = getStageInfo(stage).icon;

                    return (
                      <div key={stage} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex size-10 items-center justify-center rounded-full border-2 ${
                              isCompleted
                                ? "bg-success/20 border-success text-success"
                                : isRejected
                                  ? "bg-destructive/20 border-destructive text-destructive"
                                  : isActive
                                    ? "bg-primary/20 border-primary text-primary animate-pulse"
                                    : "bg-secondary border-border text-muted-foreground"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="size-5" />
                            ) : isRejected ? (
                              <XCircle className="size-5" />
                            ) : (
                              <StageIcon className="size-5" />
                            )}
                          </div>
                          {index < stages.length - 1 && (
                            <div
                              className={`w-0.5 h-16 ${
                                isCompleted ? "bg-success" : "bg-border"
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {getStageInfo(stage).label}
                              </p>
                              {step?.approvedAt && (
                                <p className="text-xs text-muted-foreground">
                                  {step.approvedAt.toLocaleDateString()} at{" "}
                                  {step.approvedAt.toLocaleTimeString()}
                                </p>
                              )}
                            </div>
                            {isActive && !isCompleted && !isRejected && (
                              <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                <Clock className="mr-1 size-3" />
                                Pending
                              </Badge>
                            )}
                          </div>
                          {approver && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="size-3" />
                              <span>Approved by {approver.name}</span>
                            </div>
                          )}
                          {step?.comments && (
                            <div className="mt-2 rounded-lg bg-secondary p-3 text-sm">
                              <MessageSquare className="inline-block mr-2 size-3" />
                              {step.comments}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Request Details */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Reason</p>
                    <p className="text-sm">{workflow.reason}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Requested By</p>
                    <p className="text-sm">{requester?.name || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Request Date</p>
                    <p className="text-sm">{workflow.requestedAt.toLocaleDateString()}</p>
                  </div>
                  {workflow.serialNumbers && workflow.serialNumbers.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Serial Numbers</p>
                      <p className="text-sm">{workflow.serialNumbers.join(", ")}</p>
                    </div>
                  )}
                </div>

                {workflow.documents && workflow.documents.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Attached Documents</p>
                      <div className="space-y-2">
                        {workflow.documents.map((doc, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-lg border border-border p-3"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="size-4 text-muted-foreground" />
                              <span className="text-sm">{doc}</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Add Comment */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Add Comment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="comment">Comment</Label>
                  <Textarea
                    id="comment"
                    placeholder="Add a comment or note about this request..."
                    className="bg-secondary border-0 min-h-[100px]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 size-4" />
                    Attach File
                  </Button>
                  <Button size="sm">Submit Comment</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Asset Info Sidebar */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Asset Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">{asset?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Serial Number</p>
                  <p className="text-sm">{asset?.serialNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge variant="outline" className="capitalize">
                    {asset?.category}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className="capitalize">
                    {asset?.status}
                  </Badge>
                </div>
                <Separator />
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href={`/assets/${asset?.id}`}>
                    View Full Asset Details
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {workflow.finalDecision && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Final Decision</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    {workflow.finalDecision === "transfer" && (
                      <ArrowRightLeft className="size-5 text-primary" />
                    )}
                    {workflow.finalDecision === "dispose" && (
                      <Trash2 className="size-5 text-destructive" />
                    )}
                    {workflow.finalDecision === "buyback" && (
                      <DollarSign className="size-5 text-success" />
                    )}
                    <span className="font-medium capitalize">{workflow.finalDecision}</span>
                  </div>
                  {workflow.completedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Completed on {workflow.completedAt.toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
