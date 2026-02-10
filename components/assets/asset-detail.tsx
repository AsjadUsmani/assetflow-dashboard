"use client";

import {
  Pencil,
  ArrowLeftRight,
  UserPlus,
  Trash2,
  Calendar,
  MapPin,
  Building2,
  User,
  Clock,
  History,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Asset } from "@/lib/types";
import { locations, departments, users } from "@/lib/mock-data";

const statusConfig = {
  available: { label: "Available", className: "bg-success/20 text-success border-success/30" },
  assigned: { label: "Assigned", className: "bg-primary/20 text-primary border-primary/30" },
  in_maintenance: { label: "In Maintenance", className: "bg-warning/20 text-warning border-warning/30" },
  retired: { label: "Retired", className: "bg-muted text-muted-foreground border-border" },
  lost: { label: "Lost", className: "bg-destructive/20 text-destructive border-destructive/30" },
};

const categoryConfig = {
  physical: { label: "Physical", className: "bg-chart-1/20 text-chart-1" },
  digital: { label: "Digital", className: "bg-chart-2/20 text-chart-2" },
  consumable: { label: "Consumable", className: "bg-chart-3/20 text-chart-3" },
  rechargeable: { label: "Rechargeable", className: "bg-chart-4/20 text-chart-4" },
};

interface AssetDetailProps {
  asset: Asset;
}

export function AssetDetail({ asset }: AssetDetailProps) {
  const status = statusConfig[asset.status];
  const category = categoryConfig[asset.category];
  const location = locations.find((l) => l.id === asset.locationId);
  const department = departments.find((d) => d.id === asset.departmentId);
  const assignedUser = asset.assignedToId
    ? users.find((u) => u.id === asset.assignedToId)
    : null;

  const formatDate = (date?: Date) => {
    if (!date) return "-";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {asset.name}
            </h1>
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
            <Badge variant="secondary" className={category.className}>
              {category.label}
            </Badge>
          </div>
          {asset.serialNumber && (
            <p className="text-muted-foreground">
              Serial: {asset.serialNumber}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <ArrowLeftRight className="mr-2 size-4" />
            Transfer
          </Button>
          <Button variant="outline">
            <UserPlus className="mr-2 size-4" />
            Assign
          </Button>
          <Button variant="outline">
            <Pencil className="mr-2 size-4" />
            Edit
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 size-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Asset Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Asset Type</p>
                  <p className="font-medium text-foreground">
                    {asset.assetType.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge variant="secondary" className={category.className}>
                    {category.label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className={status.className}>
                    {status.label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Serial Number</p>
                  <p className="font-medium text-foreground">
                    {asset.serialNumber || "-"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Asset Properties
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(asset.properties).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <p className="text-sm text-muted-foreground">{key}</p>
                      <p className="font-medium text-foreground">
                        {String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Movement History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="timeline">
                <TabsList>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="assignments">Assignments</TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="mt-4">
                  <div className="relative space-y-4 pl-6 before:absolute before:left-2 before:top-2 before:h-full before:w-px before:bg-border">
                    <div className="relative">
                      <div className="absolute -left-4 flex size-4 items-center justify-center rounded-full bg-primary">
                        <div className="size-2 rounded-full bg-primary-foreground" />
                      </div>
                      <div className="rounded-lg bg-secondary p-3">
                        <p className="text-sm font-medium text-foreground">
                          Transferred to Engineering
                        </p>
                        <p className="text-xs text-muted-foreground">
                          From Marketing - Employee transfer
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Jan 10, 2024 - Approved by Michael Rodriguez
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-4 flex size-4 items-center justify-center rounded-full bg-muted">
                        <div className="size-2 rounded-full bg-muted-foreground" />
                      </div>
                      <div className="rounded-lg bg-secondary p-3">
                        <p className="text-sm font-medium text-foreground">
                          Assigned to Sarah Chen
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Initial assignment
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Jun 15, 2023
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-4 flex size-4 items-center justify-center rounded-full bg-muted">
                        <div className="size-2 rounded-full bg-muted-foreground" />
                      </div>
                      <div className="rounded-lg bg-secondary p-3">
                        <p className="text-sm font-medium text-foreground">
                          Asset created
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Added to inventory
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Jun 15, 2023
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="assignments" className="mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                          <User className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Sarah Chen
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Engineering
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-success/20 text-success">
                          Current
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Since Jan 10, 2024
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Location & Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                  <MapPin className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">
                    {location?.name || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                  <Building2 className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium text-foreground">
                    {department?.name || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                  <User className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p className="font-medium text-foreground">
                    {assignedUser?.name || "Unassigned"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                  <Calendar className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Date</p>
                  <p className="font-medium text-foreground">
                    {formatDate(asset.purchaseDate)}
                  </p>
                </div>
              </div>

              {asset.expiryDate && (
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-warning/20">
                    <AlertTriangle className="size-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expiry Date</p>
                    <p className="font-medium text-warning">
                      {formatDate(asset.expiryDate)}
                    </p>
                  </div>
                </div>
              )}

              {asset.warrantyEndDate && (
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                    <Clock className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Warranty Ends
                    </p>
                    <p className="font-medium text-foreground">
                      {formatDate(asset.warrantyEndDate)}
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                  <History className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium text-foreground">
                    {formatDate(asset.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
