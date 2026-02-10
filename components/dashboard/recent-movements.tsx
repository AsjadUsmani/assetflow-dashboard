"use client";

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
import { assets, departments, users } from "@/lib/mock-data";

const movements = [
  {
    id: "mov-1",
    assetName: "MacBook Pro 16-inch",
    assetId: "asset-1",
    from: "Marketing",
    to: "Engineering",
    reason: "Employee transfer",
    status: "approved" as const,
    date: "Jan 10, 2024",
    approvedBy: "Michael Rodriguez",
  },
  {
    id: "mov-2",
    assetName: "Dell XPS 15",
    assetId: "asset-2",
    from: "West Coast Office",
    to: "Headquarters",
    reason: "Office consolidation",
    status: "pending" as const,
    date: "Jan 15, 2024",
    approvedBy: null,
  },
  {
    id: "mov-3",
    assetName: "Standing Desk",
    assetId: "asset-5",
    from: "Engineering",
    to: "Human Resources",
    reason: "Furniture redistribution",
    status: "approved" as const,
    date: "Jan 8, 2024",
    approvedBy: "David Kim",
  },
  {
    id: "mov-4",
    assetName: "HP Monitor 27-inch",
    assetId: "asset-10",
    from: "Sales",
    to: "Engineering",
    reason: "Equipment upgrade",
    status: "rejected" as const,
    date: "Jan 5, 2024",
    approvedBy: "Sarah Chen",
  },
];

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
              const status = statusConfig[movement.status];
              const StatusIcon = status.icon;

              return (
                <TableRow key={movement.id} className="border-border">
                  <TableCell className="font-medium text-foreground">
                    {movement.assetName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{movement.from}</span>
                      <ArrowRight className="size-3 text-muted-foreground" />
                      <span className="text-foreground">{movement.to}</span>
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
                    {movement.date}
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
