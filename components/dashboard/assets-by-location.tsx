"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAssets, type Asset } from "@/lib/services/assets";
import { getLocations, type Location } from "@/lib/services/locations";
import {
  isInDateRange,
  type DashboardFilterState,
} from "@/components/dashboard/filters";

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground capitalize">{item.name}:</span>
            <span className="font-medium text-foreground">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

type ChartRow = {
  name: string;
  assets: number;
  available: number;
  assigned: number;
};

export function AssetsByLocation({ filters }: { filters: DashboardFilterState }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    const location = filters.location ? Number(filters.location) : undefined;
    const department = filters.department ? Number(filters.department) : undefined;
    const assetType = filters.assetType ? Number(filters.assetType) : undefined;

    let isMounted = true;
    (async () => {
      try {
        const [assetsData, locationsData] = await Promise.all([
          getAssets({ location, department, assetType }),
          getLocations(),
        ]);
        if (!isMounted) return;
        setAssets(
          assetsData.filter((asset) => isInDateRange(asset.created_at, filters.dateRange)),
        );
        setLocations(locationsData);
      } catch {
        // ignore; dashboard can show empty chart on error
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  const data: ChartRow[] = useMemo(() => {
    if (!locations.length) return [];
    const byLocation: Record<
      number,
      { name: string; assets: number; available: number; assigned: number }
    > = {};

    locations.forEach((loc) => {
      byLocation[loc.id] = {
        name: loc.name,
        assets: 0,
        available: 0,
        assigned: 0,
      };
    });

    assets.forEach((asset) => {
      if (!asset.location_id) return;
      const bucket = byLocation[asset.location_id];
      if (!bucket) return;
      bucket.assets += 1;
      if (asset.status === "available") bucket.available += 1;
      else bucket.assigned += 1;
    });

    return Object.values(byLocation);
  }, [assets, locations]);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Assets by Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-70">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barGap={4}>
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                type="number"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: "var(--foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--secondary)" }} />
              <Bar dataKey="assigned" fill="var(--chart-1)" radius={[0, 4, 4, 0]} name="Assigned" />
              <Bar dataKey="available" fill="var(--chart-2)" radius={[0, 4, 4, 0]} name="Available" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-chart-1" />
            <span className="text-sm text-muted-foreground">Assigned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-chart-2" />
            <span className="text-sm text-muted-foreground">Available</span>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-lg bg-secondary p-3"
            >
              <span className="text-sm font-medium text-foreground">{item.name}</span>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">
                  {item.assets.toLocaleString()} total
                </span>
                <span className="text-xs text-success">
                  {item.available} available
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
