"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRightLeft,
  Trash2,
  DollarSign,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  MoreHorizontal,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { workflowRequests, assets, users } from "@/lib/mock-data";
import type { WorkflowRequest } from "@/lib/types";

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
      return { label: "Cinema Review", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    case "regional":
      return { label: "Regional Review", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    case "ho":
      return { label: "Head Office", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" };
    case "completed":
      return { label: "Completed", color: "bg-green-500/20 text-green-400 border-green-500/30" };
    case "rejected":
      return { label: "Rejected", color: "bg-red-500/20 text-red-400 border-red-500/30" };
    default:
      return { label: stage, color: "bg-secondary text-muted-foreground" };
  }
};

const getStatusIcon = (stage: string) => {
  switch (stage) {
    case "completed":
      return CheckCircle2;
    case "rejected":
      return XCircle;
    default:
      return Clock;
  }
};

export function WorkflowsList() {
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);

  const toggleWorkflow = (id: string) => {
    setSelectedWorkflows((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedWorkflows.length === workflowRequests.length) {
      setSelectedWorkflows([]);
    } else {
      setSelectedWorkflows(workflowRequests.map((w) => w.id));
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Workflow Requests
          </CardTitle>
          <Badge variant="secondary">
            {workflowRequests.length} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedWorkflows.length === workflowRequests.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Current Stage</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflowRequests.map((workflow) => {
              const Icon = getRequestIcon(workflow.requestType);
              const StatusIcon = getStatusIcon(workflow.currentStage);
              const stageInfo = getStageInfo(workflow.currentStage);
              const asset = assets.find((a) => a.id === workflow.assetId);
              const requester = users.find((u) => u.id === workflow.requestedBy);
              const completedSteps = workflow.approvalHistory.filter(
                (s) => s.status === "approved"
              ).length;
              const totalSteps = 3; // cinema, regional, ho

              return (
                <TableRow
                  key={workflow.id}
                  className="border-border cursor-pointer hover:bg-accent/50"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedWorkflows.includes(workflow.id)}
                      onCheckedChange={() => toggleWorkflow(workflow.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/workflows/${workflow.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                        <Icon className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {asset?.name || "Unknown Asset"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {asset?.serialNumber || "No serial number"}
                        </p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {workflow.requestType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{requester?.name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">
                        {requester?.role.replace("_", " ") || ""}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${stageInfo.color} flex items-center gap-1 w-fit`}
                    >
                      <StatusIcon className="size-3" />
                      {stageInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[...Array(totalSteps)].map((_, i) => (
                          <div
                            key={i}
                            className={`size-2 rounded-full ${
                              i < completedSteps
                                ? "bg-primary"
                                : i === completedSteps &&
                                    workflow.currentStage !== "completed" &&
                                    workflow.currentStage !== "rejected"
                                  ? "bg-amber-500 animate-pulse"
                                  : "bg-secondary"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {completedSteps}/{totalSteps}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {workflow.requestedAt.toLocaleDateString()}
                    </p>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/workflows/${workflow.id}`}>
                            <Eye className="mr-2 size-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 size-4" />
                          View Documents
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {workflow.currentStage !== "completed" &&
                          workflow.currentStage !== "rejected" && (
                            <>
                              <DropdownMenuItem className="text-success">
                                <CheckCircle2 className="mr-2 size-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <XCircle className="mr-2 size-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
