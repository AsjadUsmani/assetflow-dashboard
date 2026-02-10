"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  ArrowRightLeft,
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockMovements, assets, locations, users } from "@/lib/mock-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MovementsReportPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredMovements = mockMovements.filter((mov) => {
    if (statusFilter !== "all" && mov.status !== statusFilter) return false;
    if (typeFilter !== "all" && mov.type !== typeFilter) return false;
    return true;
  });

  const completedCount = mockMovements.filter((m) => m.status === "completed").length;
  const pendingCount = mockMovements.filter((m) => m.status === "pending").length;
  const approvedCount = mockMovements.filter((m) => m.status === "approved").length;
  const rejectedCount = mockMovements.filter((m) => m.status === "rejected").length;

  // Monthly movement data (mock)
  const monthlyData = [
    { month: "Jan", transfers: 12, disposals: 3, assignments: 8 },
    { month: "Feb", transfers: 18, disposals: 5, assignments: 12 },
    { month: "Mar", transfers: 15, disposals: 2, assignments: 10 },
    { month: "Apr", transfers: 22, disposals: 4, assignments: 15 },
    { month: "May", transfers: 19, disposals: 6, assignments: 11 },
    { month: "Jun", transfers: 25, disposals: 3, assignments: 18 },
  ];

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Reports", href: "/reports" },
          { label: "Movement History" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/reports">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Movement History
              </h1>
              <p className="text-muted-foreground">
                Track all asset transfers, assignments, and disposals
              </p>
            </div>
          </div>
          <Button>
            <Download className="mr-2 size-4" />
            Export Report
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/20">
                  <CheckCircle className="size-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{completedCount}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/20">
                  <Clock className="size-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/20">
                  <ArrowRightLeft className="size-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{approvedCount}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/20">
                  <XCircle className="size-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{rejectedCount}</p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Movement Trend Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Movement Trends (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="transfers"
                    fill="hsl(var(--chart-1))"
                    name="Transfers"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="assignments"
                    fill="hsl(var(--chart-2))"
                    name="Assignments"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="disposals"
                    fill="hsl(var(--chart-5))"
                    name="Disposals"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="checkout">Checkout</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Movement Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Recent Movements</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((movement) => {
                  const asset = assets.find((a) => a.id === movement.assetId);
                  const statusColors = {
                    pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
                    approved: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                    completed: "bg-green-500/20 text-green-400 border-green-500/30",
                    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
                  };

                  return (
                    <TableRow key={movement.id}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {movement.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {asset?.name || "Unknown Asset"}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{movement.fromLocation}</p>
                          {movement.fromDepartment && (
                            <p className="text-muted-foreground text-xs">
                              {movement.fromDepartment}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{movement.toLocation}</p>
                          {movement.toDepartment && (
                            <p className="text-muted-foreground text-xs">
                              {movement.toDepartment}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{movement.requestedBy}</TableCell>
                      <TableCell>{movement.requestedDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusColors[movement.status as keyof typeof statusColors]}
                        >
                          {movement.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
