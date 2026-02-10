"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Filter,
  Package,
  MapPin,
  FolderTree,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  assets,
  locations,
  departments,
  assetTypes,
  regions,
} from "@/lib/mock-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function InventoryReportPage() {
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filter assets
  const filteredAssets = assets.filter((asset) => {
    if (selectedLocation !== "all" && asset.locationId !== selectedLocation)
      return false;
    if (selectedCategory !== "all" && asset.category !== selectedCategory)
      return false;
    return true;
  });

  // Calculate stats
  const totalValue = filteredAssets.reduce(
    (sum, a) => sum + (a.purchasePrice || 0),
    0
  );
  const activeAssets = filteredAssets.filter(
    (a) => a.status === "active"
  ).length;
  const assignedAssets = filteredAssets.filter((a) => a.assignedToId).length;

  // Assets by category
  const categoryData = [
    {
      name: "IT Assets",
      value: filteredAssets.filter((a) => a.category === "it").length,
    },
    {
      name: "Projection",
      value: filteredAssets.filter((a) => a.category === "projection").length,
    },
    {
      name: "Consumables",
      value: filteredAssets.filter((a) => a.category === "consumables").length,
    },
    {
      name: "Spares",
      value: filteredAssets.filter((a) => a.category === "spares").length,
    },
  ].filter((d) => d.value > 0);

  // Assets by location
  const locationData = locations.map((loc) => ({
    name: loc.name.split(" ")[0],
    assets: filteredAssets.filter((a) => a.locationId === loc.id).length,
  }));

  // Assets by status
  const statusData = [
    {
      name: "Active",
      value: filteredAssets.filter((a) => a.status === "active").length,
    },
    {
      name: "In Maintenance",
      value: filteredAssets.filter((a) => a.status === "maintenance").length,
    },
    {
      name: "Disposed",
      value: filteredAssets.filter((a) => a.status === "disposed").length,
    },
  ].filter((d) => d.value > 0);

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Reports", href: "/reports" },
          { label: "Inventory Report" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/reports">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Inventory Report
              </h1>
              <p className="text-muted-foreground">
                Complete overview of all assets across locations
              </p>
            </div>
          </div>
          <Button>
            <Download className="mr-2 size-4" />
            Export Report
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="it">IT Assets</SelectItem>
                  <SelectItem value="projection">Projection</SelectItem>
                  <SelectItem value="consumables">Consumables</SelectItem>
                  <SelectItem value="spares">Spares</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/20">
                  <Package className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">
                    {filteredAssets.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Assets</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/20">
                  <TrendingUp className="size-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{activeAssets}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/20">
                  <FolderTree className="size-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{assignedAssets}</p>
                  <p className="text-sm text-muted-foreground">Assigned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/20">
                  <TrendingDown className="size-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">
                    ${totalValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Assets by Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="assets"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Assets by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {categoryData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Asset Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Asset Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.slice(0, 10).map((asset) => {
                  const location = locations.find(
                    (l) => l.id === asset.locationId
                  );
                  const department = departments.find(
                    (d) => d.id === asset.departmentId
                  );
                  return (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {asset.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{location?.name || "-"}</TableCell>
                      <TableCell>{department?.name || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            asset.status === "active"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : asset.status === "maintenance"
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                : "bg-red-500/20 text-red-400 border-red-500/30"
                          }
                        >
                          {asset.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${(asset.purchasePrice || 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredAssets.length > 10 && (
              <p className="text-sm text-muted-foreground text-center mt-4">
                Showing 10 of {filteredAssets.length} assets. Export report for
                full data.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
