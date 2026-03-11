"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import type { MovementsFiltersState } from "./movements-filters";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-warning/20 text-warning border-warning/30",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    className: "bg-success/20 text-success border-success/30",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    className: "bg-primary/20 text-primary border-primary/30",
  },
};

const typeConfig = {
  transfer: { label: "Transfer", className: "bg-primary/20 text-primary" },
  checkout: { label: "Checkout", className: "bg-chart-2/20 text-chart-2" },
  return: { label: "Return", className: "bg-success/20 text-success" },
  maintenance: {
    label: "Maintenance",
    className: "bg-warning/20 text-warning",
  },
  disposal: {
    label: "Disposal",
    className: "bg-destructive/20 text-destructive",
  },
};

function isMovementType(type: string): type is keyof typeof typeConfig {
  return ["transfer", "checkout", "return", "maintenance", "disposal"].includes(type);
}

export function MovementsTable({ filters }: { filters: MovementsFiltersState }) {
  const [selectedMovements, setSelectedMovements] = useState<number[]>([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<AssetRequest | null>(null);
  const [comments, setComments] = useState("");
  const [movements, setMovements] = useState<AssetRequest[]>([]);

  const getAssetName = (assetId: number | null, fallbackName: string | null) => {
    if (fallbackName) return fallbackName;
    if (!assetId) return "Unknown Asset";
    return `Asset #${assetId}`;
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const all = await getRequests();
        if (!isMounted) return;
        const movementRequests = all.filter(
          (r) =>
            isMovementType(r.type) &&
            ["pending", "approved", "rejected", "completed"].includes(r.status),
        );
        setMovements(movementRequests);
      } catch {
        // ignore, global error handler will surface if needed
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredMovements = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const status = filters.status;
    const fromLocation = filters.fromLocation.trim().toLowerCase();
    const toLocation = filters.toLocation.trim().toLowerCase();
    const dateRange = filters.dateRange;

    let fromDate: Date | null = null;
    if (dateRange !== "all") {
      const days = Number(dateRange.replace("d", ""));
      if (!Number.isNaN(days) && days > 0) {
        fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      }
    }

    return movements.filter((movement) => {
      const assetName = getAssetName(movement.asset_id, movement.asset_name).toLowerCase();
      const reason = movement.reason.toLowerCase();
      const requestNo = movement.request_number.toLowerCase();
      const requestedBy = movement.requested_by_name.toLowerCase();

      const matchesSearch =
        !search ||
        assetName.includes(search) ||
        reason.includes(search) ||
        requestNo.includes(search) ||
        requestedBy.includes(search);

      const matchesStatus = !status || movement.status === status;
      const matchesFrom =
        !fromLocation || (movement.from_location_name ?? "").toLowerCase() === fromLocation;
      const matchesTo =
        !toLocation || (movement.to_location_name ?? "").toLowerCase() === toLocation;
      const matchesDate =
        !fromDate || new Date(movement.created_at).getTime() >= fromDate.getTime();

      return matchesSearch && matchesStatus && matchesFrom && matchesTo && matchesDate;
    });
  }, [movements, filters]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMovements(filteredMovements.map((m) => m.id));
    } else {
      setSelectedMovements([]);
    }
  };

  const handleSelectMovement = (movementId: number, checked: boolean) => {
    if (checked) {
      setSelectedMovements((prev) => [...prev, movementId]);
    } else {
      setSelectedMovements((prev) => prev.filter((id) => id !== movementId));
    }
  };

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

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedMovements.length === filteredMovements.length &&
                    filteredMovements.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead className="w-10" />
              <TableHead>To</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  No movements found.
                </TableCell>
              </TableRow>
            ) : (
              filteredMovements.map((movement) => {
              const status =
                statusConfig[movement.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;
              const type = typeConfig[movement.type as keyof typeof typeConfig];

              return (
                <TableRow
                  key={movement.id}
                  className="border-border hover:bg-secondary/50"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedMovements.includes(movement.id)}
                      onCheckedChange={(checked) =>
                        handleSelectMovement(movement.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {getAssetName(movement.asset_id, movement.asset_name)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {movement.asset_id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={type.className}>
                      {type.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {movement.from_location_name ?? "—"}
                    </div>
                    {movement.justification && (
                      <div className="text-xs text-muted-foreground">
                        {movement.justification}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {movement.to_location_name ?? "—"}
                    </div>
                    {movement.current_approval_level && (
                      <div className="text-xs text-muted-foreground">
                        {movement.current_approval_level}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{movement.requested_by_name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(movement.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={status.className}>
                      <StatusIcon className="mr-1 size-3" />
                      {status.label}
                    </Badge>
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
            }))}
          </TableBody>
        </Table>
      </div>

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
                    {getAssetName(
                      selectedMovement.asset_id,
                      selectedMovement.asset_name,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Movement Type</p>
                  <Badge
                    variant="outline"
                    className={
                      typeConfig[
                        selectedMovement.type as keyof typeof typeConfig
                      ].className
                    }
                  >
                    {
                      typeConfig[
                        selectedMovement.type as keyof typeof typeConfig
                      ].label
                    }
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-medium">
                    {selectedMovement.from_location_name ?? "—"}
                  </p>
                  {selectedMovement.justification && (
                    <p className="text-sm text-muted-foreground">
                      {selectedMovement.justification}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">To</p>
                  <p className="font-medium">
                    {selectedMovement.to_location_name ?? "—"}
                  </p>
                  {selectedMovement.current_approval_level && (
                    <p className="text-sm text-muted-foreground">
                      {selectedMovement.current_approval_level}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requested By</p>
                  <p className="font-medium">
                    {selectedMovement.requested_by_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Request Date</p>
                  <p className="font-medium">
                    {new Date(
                      selectedMovement.created_at
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className={
                      statusConfig[
                        selectedMovement.status as keyof typeof statusConfig
                      ].className
                    }
                  >
                    {
                      statusConfig[
                        selectedMovement.status as keyof typeof statusConfig
                      ].label
                    }
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
