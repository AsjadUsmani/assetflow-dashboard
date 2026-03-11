"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  Monitor,
  Projector,
  Mouse,
  Wrench,
  TrendingUp,
  TrendingDown,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getAssets, type Asset } from "@/lib/services/assets";
import {
  isInDateRange,
  type DashboardFilterState,
} from "@/components/dashboard/filters";

interface StockItem {
  category: string;
  icon: React.ElementType;
  total: number;
  available: number;
  assigned: number;
  lowStock: boolean;
  trend: "up" | "down" | "stable";
  trendValue: string;
}

const ICONS = [Monitor, Projector, Mouse, Wrench];

export function StockOverview({ filters }: { filters: DashboardFilterState }) {
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
        // ignore; panel can render empty state
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  const stockData: StockItem[] = useMemo(() => {
    const buckets: Record<string, { total: number; available: number; assigned: number }> = {};

    assets.forEach((asset) => {
      const key = asset.asset_type_name || "Other";
      if (!buckets[key]) {
        buckets[key] = { total: 0, available: 0, assigned: 0 };
      }
      buckets[key].total += 1;
      if (asset.status === "available") buckets[key].available += 1;
      else buckets[key].assigned += 1;
    });

    return Object.entries(buckets)
      .map(([category, value], index) => {
        const ratio = value.total ? value.available / value.total : 0;
        return {
          category,
          icon: ICONS[index % ICONS.length],
          total: value.total,
          available: value.available,
          assigned: value.assigned,
          lowStock: ratio < 0.2,
          trend: "stable" as const,
          trendValue: "0%",
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);
  }, [assets]);

  const totalStock = stockData.reduce((acc, item) => acc + item.total, 0);
  const totalAvailable = stockData.reduce((acc, item) => acc + item.available, 0);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Package className="size-4" />
            Stock Overview
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {totalAvailable.toLocaleString()} available of {totalStock.toLocaleString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {stockData.map((item) => {
          const availablePercent = Math.round((item.available / item.total) * 100);
          const Icon = item.icon;

          return (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-md bg-secondary">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.available.toLocaleString()} available / {item.total.toLocaleString()} total
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.lowStock && (
                    <Badge variant="destructive" className="text-xs">
                      Low Stock
                    </Badge>
                  )}
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                      item.trend === "up"
                        ? "text-success"
                        : item.trend === "down"
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }`}
                  >
                    {item.trend === "up" && <TrendingUp className="size-3" />}
                    {item.trend === "down" && <TrendingDown className="size-3" />}
                    {item.trendValue}
                  </div>
                </div>
              </div>
              <Progress
                value={availablePercent}
                className={`h-2 ${item.lowStock ? "[&>div]:bg-destructive" : ""}`}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
