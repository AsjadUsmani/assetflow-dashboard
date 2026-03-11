"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock, CheckCircle2, XCircle, MoreHorizontal, Eye, CheckCircle } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getRequests, decideRequest, type AssetRequest } from "@/lib/services/requests";
import { getAssets } from "@/lib/services/assets";
import { Textarea } from "@/components/ui/textarea";
import {
  isInDateRange,
  type DashboardFilterState,
} from "@/components/dashboard/filters";

const statusConfig = {
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-success/20 text-success border-success/30",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-warning/20 text-warning border-warning/30",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
};

export function RecentMovements({ filters }: { filters: DashboardFilterState }) {
  const [movements, setMovements] = useState<AssetRequest[]>([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<AssetRequest | null>(null);
  const [comments, setComments] = useState("");
  const router = useRouter();

  const handleView = (movement: AssetRequest) => {
    setSelectedMovement(movement);
    setViewDialogOpen(true);
  };

  const handleApproveClick = (movement: AssetRequest) => {
    setSelectedMovement(movement);
    setComments("");
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (movement: AssetRequest) => {
    setSelectedMovement(movement);
    setComments("");
    setRejectDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedMovement) return;
    try {
      const updated = await decideRequest(selectedMovement.id, { decision: "approve", comment: comments });
      setMovements((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } finally {
      setApproveDialogOpen(false);
      setComments("");
    }
  };

  const handleReject = async () => {
    if (!selectedMovement) return;
    try {
      const updated = await decideRequest(selectedMovement.id, { decision: "reject", comment: comments });
      setMovements((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } finally {
      setRejectDialogOpen(false);
      setComments("");
    }
  };

  useEffect(() => {
    const location = filters.location ? Number(filters.location) : undefined;
    const department = filters.department ? Number(filters.department) : undefined;
    const assetType = filters.assetType ? Number(filters.assetType) : undefined;

    let isMounted = true;
    (async () => {
      try {
        const [all, filteredAssets] = await Promise.all([
          getRequests(),
          getAssets({ location, department, assetType }),
        ]);
        if (!isMounted) return;
        const filteredAssetIds = new Set(filteredAssets.map((asset) => asset.id));
        const hasAssetFilter = Boolean(location || department || assetType);

        const movementRequests = all.filter((r) =>
          ["transfer", "checkout", "return", "maintenance", "disposal"].includes(r.type) &&
          isInDateRange(r.created_at, filters.dateRange) &&
          (r.asset_id == null ? !hasAssetFilter : filteredAssetIds.has(r.asset_id)),
        );
        // Show the latest 4 by created_at
        movementRequests.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setMovements(movementRequests.slice(0, 4));
      } catch {
        // swallow; global handler can surface toast separately
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  return (
    <>
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Recent Movements</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary" onClick={() => router.push("/movements")}>
          View all
        </Button>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Asset</TableHead>
              <TableHead className="text-muted-foreground">Transfer</TableHead>
              <TableHead className="text-muted-foreground">Reason</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement) => {
              const status = statusConfig[movement.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;

              return (
                <TableRow key={movement.id} className="border-border">
                  <TableCell className="font-medium text-foreground max-w-30 truncate">
                    {movement.asset_name ?? `Asset #${movement.asset_id ?? ""}`}
                  </TableCell>
                  <TableCell className="max-w-37.5">
                    <div className="flex items-center gap-1 text-sm min-w-0">
                      <span className="text-muted-foreground truncate">
                        {movement.from_location_name ?? "—"}
                      </span>
                      <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                      <span className="text-foreground truncate">
                        {movement.to_location_name ?? "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-30 truncate">
                    {movement.reason}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={status.className}>
                      <StatusIcon className="mr-1 size-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {new Date(movement.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(movement)}>
                          <Eye className="mr-2 size-4" />
                          View Details
                        </DropdownMenuItem>
                        {movement.status === "pending" && (
                          <>
                            <DropdownMenuItem className="text-success" onClick={() => handleApproveClick(movement)}>
                              <CheckCircle className="mr-2 size-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleRejectClick(movement)}>
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

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Movement Details</DialogTitle>
            <DialogDescription>
              View detailed information about this asset movement
            </DialogDescription>
          </DialogHeader>
          {selectedMovement && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Asset</p>
                  <p className="font-medium">
                    {selectedMovement.asset_name ?? `Asset #${selectedMovement.asset_id ?? ""}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Movement Type</p>
                  <p className="font-medium capitalize">{selectedMovement.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-medium">
                    {selectedMovement.from_location_name ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">To</p>
                  <p className="font-medium">
                    {selectedMovement.to_location_name ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requested By</p>
                  <p className="font-medium">{selectedMovement.requested_by_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Request Date</p>
                  <p className="font-medium">
                    {new Date(selectedMovement.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className={
                      statusConfig[selectedMovement.status as keyof typeof statusConfig]?.className
                    }
                  >
                    {statusConfig[selectedMovement.status as keyof typeof statusConfig]?.label ?? selectedMovement.status}
                  </Badge>
                </div>
                {selectedMovement.status === "approved" && (
                  <div>
                    <p className="text-sm text-muted-foreground">Approved By</p>
                    <p className="font-medium">System Approval</p>
                  </div>
                )}
              </div>
              {selectedMovement.reason && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm mt-1 p-3 rounded-md bg-secondary">
                    {selectedMovement.reason}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this request? This action will move the request to the next approval stage.
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
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this request? Please provide a reason for the rejection.
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
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!comments.trim()}>
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
