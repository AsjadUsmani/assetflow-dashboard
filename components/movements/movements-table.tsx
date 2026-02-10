"use client";

import { useState } from "react";
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
import { mockMovements, assets } from "@/lib/mock-data";

interface Movement {
  id: string;
  assetId: string;
  type: "transfer" | "checkout" | "return" | "maintenance" | "disposal";
  fromLocation: string;
  fromDepartment?: string;
  toLocation: string;
  toDepartment?: string;
  requestedBy: string;
  requestedDate: string;
  status: "pending" | "approved" | "rejected" | "completed";
  approvedBy?: string;
  notes?: string;
}

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

export function MovementsTable() {
  const [selectedMovements, setSelectedMovements] = useState<string[]>([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(
    null
  );

  const getAssetName = (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    return asset?.name || "Unknown Asset";
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMovements(mockMovements.map((m) => m.id));
    } else {
      setSelectedMovements([]);
    }
  };

  const handleSelectMovement = (movementId: string, checked: boolean) => {
    if (checked) {
      setSelectedMovements([...selectedMovements, movementId]);
    } else {
      setSelectedMovements(selectedMovements.filter((id) => id !== movementId));
    }
  };

  const handleView = (movement: Movement) => {
    setSelectedMovement(movement);
    setViewDialogOpen(true);
  };

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedMovements.length === mockMovements.length}
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
            {mockMovements.map((movement) => {
              const status = statusConfig[movement.status];
              const StatusIcon = status.icon;
              const type = typeConfig[movement.type];

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
                      {getAssetName(movement.assetId)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {movement.assetId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={type.className}>
                      {type.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{movement.fromLocation}</div>
                    {movement.fromDepartment && (
                      <div className="text-xs text-muted-foreground">
                        {movement.fromDepartment}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{movement.toLocation}</div>
                    {movement.toDepartment && (
                      <div className="text-xs text-muted-foreground">
                        {movement.toDepartment}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{movement.requestedBy}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(movement.requestedDate).toLocaleDateString()}
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
                            <DropdownMenuItem className="text-success">
                              <CheckCircle className="mr-2 size-4" />
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
                    {getAssetName(selectedMovement.assetId)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Movement Type</p>
                  <Badge
                    variant="outline"
                    className={typeConfig[selectedMovement.type].className}
                  >
                    {typeConfig[selectedMovement.type].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-medium">{selectedMovement.fromLocation}</p>
                  {selectedMovement.fromDepartment && (
                    <p className="text-sm text-muted-foreground">
                      {selectedMovement.fromDepartment}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">To</p>
                  <p className="font-medium">{selectedMovement.toLocation}</p>
                  {selectedMovement.toDepartment && (
                    <p className="text-sm text-muted-foreground">
                      {selectedMovement.toDepartment}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requested By</p>
                  <p className="font-medium">{selectedMovement.requestedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Request Date</p>
                  <p className="font-medium">
                    {new Date(
                      selectedMovement.requestedDate
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className={statusConfig[selectedMovement.status].className}
                  >
                    {statusConfig[selectedMovement.status].label}
                  </Badge>
                </div>
                {selectedMovement.approvedBy && (
                  <div>
                    <p className="text-sm text-muted-foreground">Approved By</p>
                    <p className="font-medium">{selectedMovement.approvedBy}</p>
                  </div>
                )}
              </div>
              {selectedMovement.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm mt-1 p-3 rounded-md bg-secondary">
                    {selectedMovement.notes}
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
    </>
  );
}
