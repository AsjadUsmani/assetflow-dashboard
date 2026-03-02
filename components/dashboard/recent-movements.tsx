"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Clock, CheckCircle2, XCircle, MoreHorizontal } from "lucide-react";
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
import { getRequests, type AssetRequest } from "@/lib/services/requests";

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

export function RecentMovements() {
  const [movements, setMovements] = useState<AssetRequest[]>([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const all = await getRequests();
        if (!isMounted) return;
        const movementRequests = all.filter((r) =>
          ["transfer", "checkout", "return", "maintenance", "disposal"].includes(r.type),
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
  }, []);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Recent Movements</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          View all
        </Button>
      </CardHeader>
      <CardContent>
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
                  <TableCell className="font-medium text-foreground">
                    {movement.asset_name ?? `Asset #${movement.asset_id ?? ""}`}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        {movement.from_location_name ?? "—"}
                      </span>
                      <ArrowRight className="size-3 text-muted-foreground" />
                      <span className="text-foreground">
                        {movement.to_location_name ?? "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {movement.reason}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={status.className}>
                      <StatusIcon className="mr-1 size-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
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
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        {movement.status === "pending" && (
                          <>
                            <DropdownMenuItem className="text-success">
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
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
