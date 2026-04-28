"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  UserX,
  Clock,
  CheckCircle,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getAssets } from "@/lib/services/assets";
import { getRequests, type AssetRequest } from "@/lib/services/requests";
import {
  isInDateRange,
  type DashboardFilterState,
} from "@/components/dashboard/filters";

type Stat = {
  title: string;
  value: string;
  change: string | null;
  trend: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  href?: string;
  highlight?: boolean;
};

type AlertStat = {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  variant: "warning" | "destructive";
  description: string;
};

export function DashboardStats({ filters }: { filters: DashboardFilterState }) {
  const [assetCount, setAssetCount] = useState<number>(0);
  const [requests, setRequests] = useState<AssetRequest[]>([]);

  useEffect(() => {
    const location = filters.location ? Number(filters.location) : undefined;
    const department = filters.department ? Number(filters.department) : undefined;
    const assetType = filters.assetType ? Number(filters.assetType) : undefined;

    let isMounted = true;

    /*
      ORIGINAL: assets and requests were fetched together via Promise.all.
      If `getRequests()` failed, `getAssets()` was discarded and `assetCount` stayed at 0.
      Keeping the original code commented for reference.

    (async () => {
      try {
        const [assetsData, requestsData] = await Promise.all([
          getAssets({ location, department, assetType }),
          getRequests(),
        ]);
        if (!isMounted) return;
        const filteredAssets = assetsData.filter((asset) =>
          isInDateRange(asset.created_at, filters.dateRange),
        );
        const assetIds = new Set(filteredAssets.map((asset) => asset.id));
        const filteredRequests = requestsData.filter((request) => {
          const matchesDate = isInDateRange(request.created_at, filters.dateRange);
          if (!matchesDate) return false;
          if (request.asset_id == null) return true;
          return assetIds.has(request.asset_id);
        });

        setAssetCount(filteredAssets.length);
        setRequests(filteredRequests);
      } catch {
        // ignore; global error handler can surface issues if needed
      }
    })();

    */

    (async () => {
      // Fetch assets first and always set assetCount when possible.
      try {
        const assetsData = await getAssets({ location, department, assetType });
        if (!isMounted) return;
        const filteredAssets = assetsData.filter((asset) =>
          isInDateRange(asset.created_at, filters.dateRange),
        );
        const assetIds = new Set(filteredAssets.map((asset) => asset.id));
        setAssetCount(filteredAssets.length);

        // Fetch requests separately; if this fails, keep requests as empty array.
        try {
          const requestsData = await getRequests();
          if (!isMounted) return;
          const filteredRequests = requestsData.filter((request) => {
            const matchesDate = isInDateRange(request.created_at, filters.dateRange);
            if (!matchesDate) return false;
            if (request.asset_id == null) return true;
            return assetIds.has(request.asset_id);
          });
          setRequests(filteredRequests);
        } catch {
          // keep requests empty if requests endpoint is unavailable
          setRequests([]);
        }
      } catch {
        // assets failed — leave assetCount at 0
        // still attempt to fetch requests separately
        try {
          const requestsData = await getRequests();
          if (!isMounted) return;
          const filteredRequests = requestsData.filter((request) =>
            isInDateRange(request.created_at, filters.dateRange),
          );
          setRequests(filteredRequests);
        } catch {
          setRequests([]);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  const { stats, alertStats } = useMemo(() => {
    const pending = requests.filter((r) =>
      ["pending", "in_review"].includes(r.status),
    ).length;
    const today = new Date().toDateString();
    const approvedToday = requests.filter(
      (r) => r.status === "approved" && r.decided_at && new Date(r.decided_at).toDateString() === today,
    ).length;

    const expiringSoon = 0; // can be derived from assets with expiry_date in future enhancement
    const accountabilityGaps = 0; // can be derived from assets without assignment in future enhancement

    const stats: Stat[] = [
      {
        title: "Total Assets",
        value: assetCount.toLocaleString(),
        change: null,
        trend: "neutral",
        icon: Package,
        description: "Across all locations",
        href: "/assets",
      },
      {
        title: "Pending Approvals",
        value: pending.toString(),
        change: null,
        trend: "neutral",
        icon: Clock,
        description: "Awaiting your review",
        href: "/requests?status=pending",
        highlight: pending > 0,
      },
      {
        title: "Approved Today",
        value: approvedToday.toString(),
        change: null,
        trend: "neutral",
        icon: CheckCircle,
        description: "Requests approved today",
        href: "/requests?status=approved",
      },
      {
        title: "Total Requests",
        value: requests.length.toString(),
        change: null,
        trend: "neutral",
        icon: FileText,
        description: "All time",
        href: "/requests",
      },
    ];

    const alertStats: AlertStat[] = [
      {
        title: "Expiring Soon",
        value: expiringSoon,
        icon: AlertTriangle,
        variant: "warning",
        description: "Within 30 days",
      },
      {
        title: "Accountability Gaps",
        value: accountabilityGaps,
        icon: UserX,
        variant: "destructive",
        description: "Missing assignments",
      },
    ];

    return { stats, alertStats };
  }, [assetCount, requests]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      {stats.map((stat) => {
        const isHighlight = stat.highlight;
        const card = (
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
        );

        return (
          <div key={stat.title}>
            {stat.href ? <Link href={stat.href}>{card}</Link> : card}
          </div>
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
