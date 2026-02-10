"use client";

import Link from "next/link";
import {
  Package,
  Monitor,
  Recycle,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  UserX,
  Clock,
  CheckCircle,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { dashboardStats, assetRequests } from "@/lib/mock-data";

// Calculate request stats
const pendingRequests = assetRequests.filter((r) =>
  ["pending", "in_review"].includes(r.status)
).length;
const approvedRequests = assetRequests.filter((r) => r.status === "approved").length;

const stats = [
  {
    title: "Total Assets",
    value: dashboardStats.totalAssets.toLocaleString(),
    change: "+12.5%",
    trend: "up" as const,
    icon: Package,
    description: "vs last month",
    href: "/assets",
  },
  {
    title: "Pending Approvals",
    value: pendingRequests.toString(),
    change: null,
    trend: "neutral" as const,
    icon: Clock,
    description: "Awaiting your review",
    href: "/requests?status=pending",
    highlight: pendingRequests > 0,
  },
  {
    title: "Approved Today",
    value: approvedRequests.toString(),
    change: null,
    trend: "neutral" as const,
    icon: CheckCircle,
    description: "Ready for action",
    href: "/requests?status=approved",
  },
  {
    title: "Total Requests",
    value: assetRequests.length.toString(),
    change: "+24.8%",
    trend: "up" as const,
    icon: FileText,
    description: "This month",
    href: "/requests",
  },
];

const alertStats = [
  {
    title: "Expiring Soon",
    value: dashboardStats.expiringAssets,
    icon: AlertTriangle,
    variant: "warning" as const,
    description: "Within 30 days",
  },
  {
    title: "Accountability Gaps",
    value: dashboardStats.assetsWithGaps,
    icon: UserX,
    variant: "destructive" as const,
    description: "Missing assignments",
  },
];

export function DashboardStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      {stats.map((stat) => {
        const CardWrapper = stat.href ? Link : "div";
        const cardProps = stat.href ? { href: stat.href } : {};
        const isHighlight = "highlight" in stat && stat.highlight;

        return (
          <CardWrapper key={stat.title} {...cardProps}>
            <Card
              className={`bg-card border-border transition-colors ${stat.href ? "hover:bg-accent cursor-pointer" : ""} ${isHighlight ? "border-amber-500/50 bg-amber-500/5" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex size-10 items-center justify-center rounded-lg ${isHighlight ? "bg-amber-500/20" : "bg-secondary"}`}
                  >
                    <stat.icon
                      className={`size-5 ${isHighlight ? "text-amber-400" : "text-muted-foreground"}`}
                    />
                  </div>
                  {stat.change && (
                    <div
                      className={`flex items-center gap-1 text-xs font-medium ${
                        stat.trend === "up" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {stat.trend === "up" ? (
                        <TrendingUp className="size-3" />
                      ) : (
                        <TrendingDown className="size-3" />
                      )}
                      {stat.change}
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <p
                    className={`text-2xl font-semibold tracking-tight ${isHighlight ? "text-amber-400" : ""}`}
                  >
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {stat.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </CardWrapper>
        );
      })}

      {alertStats.map((stat) => (
        <Card
          key={stat.title}
          className={`border-border ${
            stat.variant === "warning"
              ? "bg-warning/10 border-warning/30"
              : "bg-destructive/10 border-destructive/30"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div
                className={`flex size-10 items-center justify-center rounded-lg ${
                  stat.variant === "warning" ? "bg-warning/20" : "bg-destructive/20"
                }`}
              >
                <stat.icon
                  className={`size-5 ${
                    stat.variant === "warning"
                      ? "text-warning"
                      : "text-destructive"
                  }`}
                />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
              <p
                className={`text-sm font-medium ${
                  stat.variant === "warning" ? "text-warning" : "text-destructive"
                }`}
              >
                {stat.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stat.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
