"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { getAssets, type Asset } from "@/lib/services/assets";
import {
  isInDateRange,
  type DashboardFilterState,
} from "@/components/dashboard/filters";

type CategorySlice = {
  name: string;
  value: number;
  color: string;
};

const COLORS: Record<string, string> = {
  physical: "var(--chart-1)",
  digital: "var(--chart-2)",
  consumable: "var(--chart-3)",
  rechargeable: "var(--chart-4)",
  other: "var(--chart-5)",
};

const CustomTooltip = ({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
  total: number;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground">{payload[0].name}</p>
        <p className="text-lg font-semibold text-foreground">
          {payload[0].value.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          {total ? ((payload[0].value / total) * 100).toFixed(1) : "0.0"}% of total
        </p>
      </div>
    );
  }
  return null;
};

export function AssetsByCategory({ filters }: { filters: DashboardFilterState }) {
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
        // ignore; empty chart is acceptable fallback
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  const data: CategorySlice[] = useMemo(() => {
    if (!assets.length) return [];
    const buckets: Record<string, number> = {};

    assets.forEach((asset) => {
      const key = asset.asset_type_name || "Other";
      buckets[key] = (buckets[key] ?? 0) + 1;
    });

    return Object.entries(buckets).map(([name, value], index) => ({
      name,
      value,
      color: Object.values(COLORS)[index % Object.values(COLORS).length],
    }));
  }, [assets]);

  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data],
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Assets by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-70">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip total={total} />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-lg bg-secondary p-3"
            >
              <div className="flex items-center gap-2">
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-foreground">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
