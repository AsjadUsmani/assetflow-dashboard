"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getAssets, type Asset } from "@/lib/services/assets";
import {
  isInDateRange,
  type DashboardFilterState,
} from "@/components/dashboard/filters";

type ExpiringAsset = {
  id: string;
  name: string;
  type: string;
  expiryDate: string;
  daysLeft: number;
  urgency: "critical" | "warning" | "normal";
};

const urgencyConfig = {
  critical: {
    label: "Critical",
    color: "text-destructive",
    bgColor: "bg-destructive/20",
    progressColor: "bg-destructive",
  },
  warning: {
    label: "Soon",
    color: "text-warning",
    bgColor: "bg-warning/20",
    progressColor: "bg-warning",
  },
  normal: {
    label: "Normal",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    progressColor: "bg-muted-foreground",
  },
};

export function ExpiringAssets({ filters }: { filters: DashboardFilterState }) {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const location = filters.location ? Number(filters.location) : undefined;
    const department = filters.department ? Number(filters.department) : undefined;
    const assetType = filters.assetType ? Number(filters.assetType) : undefined;

    let isMounted = true;
    (async () => {
      try {
        const data = await getAssets({ location, department, assetType });
        if (!isMounted) return;
        setAssets(data.filter((asset) => isInDateRange(asset.created_at, filters.dateRange)));
      } catch {
        // ignore
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  const expiringAssets: ExpiringAsset[] = useMemo(() => {
    const now = Date.now();
    return assets
      .filter((asset) => asset.expiry_date)
      .map((asset) => {
        const daysLeft = Math.ceil(
          (new Date(asset.expiry_date as string).getTime() - now) / (1000 * 60 * 60 * 24),
        );
        const urgency: ExpiringAsset["urgency"] =
          daysLeft <= 7 ? "critical" : daysLeft <= 30 ? "warning" : "normal";
        return {
          id: String(asset.id),
          name: asset.name,
          type: asset.asset_type_name || "Asset",
          expiryDate: new Date(asset.expiry_date as string).toLocaleDateString(),
          daysLeft,
          urgency,
        };
      })
      .filter((asset) => asset.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 4);
  }, [assets]);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <AlertTriangle className="size-4 text-warning" />
          Expiring Soon
        </CardTitle>
        <Badge variant="secondary" className="bg-warning/20 text-warning">
          {expiringAssets.length}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {expiringAssets.map((asset) => {
          const urgency = urgencyConfig[asset.urgency];
          const progressValue = Math.max(0, Math.min(100, 100 - (asset.daysLeft / 90) * 100));

          return (
            <div
              key={asset.id}
              className="group flex items-center justify-between rounded-lg bg-secondary p-3 cursor-pointer hover:bg-accent transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {asset.name}
                </p>
                <p className="text-xs text-muted-foreground">{asset.type}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Progress
                    value={progressValue}
                    className={`h-1.5 flex-1 bg-muted [&>div]:${urgency.progressColor}`}
                  />
                  <span className={`text-xs font-medium ${urgency.color}`}>
                    {asset.daysLeft}d
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="size-3" />
                    {asset.expiryDate}
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          );
        })}

        <Button variant="ghost" className="w-full text-primary hover:text-primary">
          View all expiring assets
        </Button>
      </CardContent>
    </Card>
  );
}
