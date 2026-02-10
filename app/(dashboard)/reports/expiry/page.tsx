"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle,
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
import { assets, locations, departments } from "@/lib/mock-data";

export default function ExpiryReportPage() {
  const [timeframe, setTimeframe] = useState<string>("30");

  const today = new Date();
  const daysAhead = parseInt(timeframe);

  // Filter assets with warranty expiry dates
  const assetsWithExpiry = assets.filter((asset) => asset.warrantyExpiry);

  const getExpiryStatus = (expiryDate: Date) => {
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: "expired", days: Math.abs(diffDays), label: "Expired" };
    if (diffDays <= 7) return { status: "critical", days: diffDays, label: "Critical" };
    if (diffDays <= 30) return { status: "warning", days: diffDays, label: "Warning" };
    if (diffDays <= 90) return { status: "upcoming", days: diffDays, label: "Upcoming" };
    return { status: "ok", days: diffDays, label: "OK" };
  };

  const filteredAssets = assetsWithExpiry
    .map((asset) => ({
      ...asset,
      expiryInfo: getExpiryStatus(asset.warrantyExpiry!),
    }))
    .filter((asset) => asset.expiryInfo.days <= daysAhead || asset.expiryInfo.status === "expired")
    .sort((a, b) => a.expiryInfo.days - b.expiryInfo.days);

  const expiredCount = filteredAssets.filter((a) => a.expiryInfo.status === "expired").length;
  const criticalCount = filteredAssets.filter((a) => a.expiryInfo.status === "critical").length;
  const warningCount = filteredAssets.filter((a) => a.expiryInfo.status === "warning").length;
  const upcomingCount = filteredAssets.filter((a) => a.expiryInfo.status === "upcoming").length;

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Reports", href: "/reports" },
          { label: "Expiry Report" },
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
                Expiry Report
              </h1>
              <p className="text-muted-foreground">
                Track warranty and license expiration dates
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Next 7 days</SelectItem>
                <SelectItem value="30">Next 30 days</SelectItem>
                <SelectItem value="90">Next 90 days</SelectItem>
                <SelectItem value="180">Next 6 months</SelectItem>
                <SelectItem value="365">Next year</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Download className="mr-2 size-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border border-red-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/20">
                  <AlertTriangle className="size-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-red-400">{expiredCount}</p>
                  <p className="text-sm text-muted-foreground">Expired</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/20">
                  <Clock className="size-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-amber-400">{criticalCount}</p>
                  <p className="text-sm text-muted-foreground">Critical (7 days)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border border-yellow-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-500/20">
                  <Calendar className="size-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-yellow-400">{warningCount}</p>
                  <p className="text-sm text-muted-foreground">Warning (30 days)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/20">
                  <CheckCircle className="size-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{upcomingCount}</p>
                  <p className="text-sm text-muted-foreground">Upcoming (90 days)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expiry Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Assets Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-green-500/20 mb-4">
                  <CheckCircle className="size-6 text-green-500" />
                </div>
                <p className="text-lg font-medium">No expiring assets</p>
                <p className="text-sm text-muted-foreground">
                  All assets are within their warranty period for the selected timeframe.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Days Remaining</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => {
                    const location = locations.find((l) => l.id === asset.locationId);
                    const statusColors = {
                      expired: "bg-red-500/20 text-red-400 border-red-500/30",
                      critical: "bg-amber-500/20 text-amber-400 border-amber-500/30",
                      warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                      upcoming: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                      ok: "bg-green-500/20 text-green-400 border-green-500/30",
                    };

                    return (
                      <TableRow key={asset.id}>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusColors[asset.expiryInfo.status as keyof typeof statusColors]}
                          >
                            {asset.expiryInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {asset.serialNumber || "-"}
                        </TableCell>
                        <TableCell>{location?.name || "-"}</TableCell>
                        <TableCell>
                          {asset.warrantyExpiry?.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              asset.expiryInfo.status === "expired"
                                ? "text-red-400"
                                : asset.expiryInfo.status === "critical"
                                  ? "text-amber-400"
                                  : ""
                            }
                          >
                            {asset.expiryInfo.status === "expired"
                              ? `${asset.expiryInfo.days} days ago`
                              : `${asset.expiryInfo.days} days`}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
