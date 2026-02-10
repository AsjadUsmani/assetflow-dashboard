"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { locations } from "@/lib/mock-data";

const data = [
  { name: "Headquarters", assets: 1245, available: 420, assigned: 825 },
  { name: "West Coast", assets: 823, available: 312, assigned: 511 },
  { name: "Chicago", assets: 479, available: 160, assigned: 319 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number }>; label?: string }) => {
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

export function AssetsByLocation() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Assets by Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
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
