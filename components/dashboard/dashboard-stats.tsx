"use client";

import { useMemo } from "react";
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
import { type Asset } from "@/lib/services/assets";
import { type AssetRequest } from "@/lib/services/requests";
import {
  hasMissingNonCompulsoryInfo,
  isWarrantyEndingWithinDays,
  type AssetPresetFilter,
} from "@/lib/asset-insights";
import { type DashboardFilterState } from "@/components/dashboard/filters";

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

type Props = {
  filters: DashboardFilterState;
  filteredAssets: Asset[];
  filteredRequests: AssetRequest[];
};

export function DashboardStats({ filters, filteredAssets, filteredRequests }: Props) {
  const buildAssetsHref = (preset?: AssetPresetFilter) => {
    const params = new URLSearchParams();
    if (preset) params.set("preset", preset);
    if (filters.assetType) params.set("assetType", filters.assetType);
    if (filters.location) params.set("location", filters.location);
    if (filters.department) params.set("department", filters.department);
    if (filters.dateRange && filters.dateRange !== "all") {
      params.set("dateRange", filters.dateRange);
    }
    const qs = params.toString();
    return qs ? `/assets?${qs}` : "/assets";
  };

  const { assetCount, missingInfoCount, warrantyEndingSoonCount } = useMemo(() => {
    let missing = 0;
    let warrantyEnding = 0;

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const thirtyDaysOut = startOfDay + 30 * 24 * 60 * 60 * 1000;

    for (const asset of filteredAssets) {
      if (hasMissingNonCompulsoryInfo(asset)) missing++;
      if (asset.warranty_end_date) {
        const t = new Date(asset.warranty_end_date).getTime();
        if (!Number.isNaN(t) && t >= startOfDay && t <= thirtyDaysOut) warrantyEnding++;
      }
    }

    return {
      assetCount: filteredAssets.length,
      missingInfoCount: missing,
      warrantyEndingSoonCount: warrantyEnding,
    };
  }, [filteredAssets]);

  const { stats, alertStats } = useMemo(() => {
    const pending = filteredRequests.filter((r) =>
      ["pending", "in_review"].includes(r.status),
    ).length;
    const today = new Date().toDateString();
    const approvedToday = filteredRequests.filter(
      (r) =>
        r.status === "approved" &&
        r.decided_at &&
        new Date(r.decided_at).toDateString() === today,
    ).length;

    const stats: Stat[] = [
      {
        title: "Total Assets",
        value: assetCount.toLocaleString(),
        change: null,
        trend: "neutral",
        icon: Package,
        description: "Across all locations",
        href: buildAssetsHref(),
      },
      {
        title: "Assets with missing information",
        value: missingInfoCount.toLocaleString(),
        change: null,
        trend: "neutral",
        icon: AlertTriangle,
        description: "At least 1 non-compulsory field is empty",
        href: buildAssetsHref("missing-info"),
      },
      {
        title: "Warranty ending in next 30 days",
        value: warrantyEndingSoonCount.toLocaleString(),
        change: null,
        trend: "neutral",
        icon: Clock,
        description: "Assets with warranty close to expiry",
        href: buildAssetsHref("warranty-ending-soon"),
      },
    ];

    const alertStats: AlertStat[] = [];

    return { stats, alertStats };
  }, [assetCount, missingInfoCount, warrantyEndingSoonCount, filteredRequests]);

  return (
    <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      {stats.map((stat) => {
        const isHighlight = stat.highlight;
        const card = (
          <Card
            className={`h-full bg-card border-border transition-colors ${stat.href ? "hover:bg-accent cursor-pointer" : ""} ${isHighlight ? "border-amber-500/50 bg-amber-500/5" : ""}`}
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
                <p className="text-sm font-medium text-foreground">{stat.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        );

        return (
          <div key={stat.title} className="h-full">
            {stat.href ? (
              <Link href={stat.href} className="block h-full">
                {card}
              </Link>
            ) : (
              card
            )}
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
                    stat.variant === "warning" ? "text-warning" : "text-destructive"
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
              <p className="text-xs text-muted-foreground mt-0.5">{stat.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
