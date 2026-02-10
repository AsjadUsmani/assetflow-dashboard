"use client";

import React from "react"

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

const stockData: StockItem[] = [
  {
    category: "IT Assets",
    icon: Monitor,
    total: 1247,
    available: 312,
    assigned: 892,
    lowStock: false,
    trend: "up",
    trendValue: "+12%",
  },
  {
    category: "Projection",
    icon: Projector,
    total: 156,
    available: 23,
    assigned: 128,
    lowStock: true,
    trend: "down",
    trendValue: "-5%",
  },
  {
    category: "Consumables",
    icon: Mouse,
    total: 543,
    available: 187,
    assigned: 312,
    lowStock: false,
    trend: "up",
    trendValue: "+8%",
  },
  {
    category: "Spares & Parts",
    icon: Wrench,
    total: 324,
    available: 156,
    assigned: 145,
    lowStock: false,
    trend: "stable",
    trendValue: "0%",
  },
];

export function StockOverview() {
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
