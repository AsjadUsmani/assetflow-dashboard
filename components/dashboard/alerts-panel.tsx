"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, UserX, Package, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAssets, type Asset } from "@/lib/services/assets";
import { getRequests, type AssetRequest } from "@/lib/services/requests";
import {
  isInDateRange,
  type DashboardFilterState,
} from "@/components/dashboard/filters";

type AlertItem = {
  id: string;
  type: "gap" | "untracked" | "maintenance";
  title: string;
  description: string;
  icon: typeof UserX;
  actionLabel: string;
};

const alertTypeConfig = {
  gap: {
    bgColor: "bg-destructive/10",
    iconColor: "text-destructive",
    borderColor: "border-destructive/20",
  },
  untracked: {
    bgColor: "bg-warning/10",
    iconColor: "text-warning",
    borderColor: "border-warning/20",
  },
  maintenance: {
    bgColor: "bg-primary/10",
    iconColor: "text-primary",
    borderColor: "border-primary/20",
  },
};

export function AlertsPanel({ filters }: { filters: DashboardFilterState }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [requests, setRequests] = useState<AssetRequest[]>([]);

  useEffect(() => {
    const location = filters.location ? Number(filters.location) : undefined;
    const department = filters.department ? Number(filters.department) : undefined;
    const assetType = filters.assetType ? Number(filters.assetType) : undefined;

    let isMounted = true;
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
        const filteredRequests = requestsData.filter((request) =>
          isInDateRange(request.created_at, filters.dateRange) &&
          (request.asset_id == null || assetIds.has(request.asset_id)),
        );

        setAssets(filteredAssets);
        setRequests(filteredRequests);
      } catch {
        // ignore
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  const alerts: AlertItem[] = useMemo(() => {
    const accountabilityGaps = assets.filter((asset) => asset.assigned_to_user_id == null).length;
    const untrackedAssets = assets.filter((asset) => !asset.asset_type_name).length;
    const maintenanceDue = requests.filter(
      (request) => request.type === "maintenance" && ["pending", "in_review"].includes(request.status),
    ).length;

    return [
      {
        id: "gap",
        type: "gap",
        title: "Accountability Gap",
        description: `${accountabilityGaps} assets have no assigned owner`,
        icon: UserX,
        actionLabel: "Review assets",
      },
      {
        id: "untracked",
        type: "untracked",
        title: "Untracked Assets",
        description: `${untrackedAssets} assets need categorization`,
        icon: Package,
        actionLabel: "Categorize now",
      },
      {
        id: "maintenance",
        type: "maintenance",
        title: "Maintenance Due",
        description: `${maintenanceDue} maintenance requests are pending`,
        icon: AlertCircle,
        actionLabel: "View schedule",
      },
    ];
  }, [assets, requests]);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <AlertCircle className="size-4 text-destructive" />
          Action Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const config = alertTypeConfig[alert.type];
          const Icon = alert.icon;

          return (
            <div
              key={alert.id}
              className={`group flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-accent ${config.bgColor} ${config.borderColor}`}
            >
              <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${config.bgColor}`}>
                <Icon className={`size-4 ${config.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {alert.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {alert.description}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-primary mt-1"
                >
                  {alert.actionLabel}
                  <ChevronRight className="ml-1 size-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
