"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { dashboardStats } from "@/lib/mock-data";

const data = [
  {
    name: "Physical",
    value: dashboardStats.assetsByCategory.physical,
    color: "var(--chart-1)",
  },
  {
    name: "Digital",
    value: dashboardStats.assetsByCategory.digital,
    color: "var(--chart-2)",
  },
  {
    name: "Consumable",
    value: dashboardStats.assetsByCategory.consumable,
    color: "var(--chart-3)",
  },
  {
    name: "Rechargeable",
    value: dashboardStats.assetsByCategory.rechargeable,
    color: "var(--chart-4)",
  },
];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground">{payload[0].name}</p>
        <p className="text-lg font-semibold text-foreground">
          {payload[0].value.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          {((payload[0].value / dashboardStats.totalAssets) * 100).toFixed(1)}%
          of total
        </p>
      </div>
    );
  }
  return null;
};

export function AssetsByCategory() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Assets by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
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
              <Tooltip content={<CustomTooltip />} />
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
