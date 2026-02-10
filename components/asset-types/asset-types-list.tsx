"use client";

import {
  Calendar,
  Zap,
  Package,
  ArrowLeftRight,
  UserCheck,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { assetTypes } from "@/lib/mock-data";

const behaviorFlags = [
  { key: "hasExpiry", label: "Has Expiry", icon: Calendar },
  { key: "isRechargeable", label: "Rechargeable", icon: Zap },
  { key: "isOneTimeUse", label: "One-Time Use", icon: Package },
  { key: "isMovable", label: "Movable", icon: ArrowLeftRight },
  { key: "requiresAssignment", label: "Requires Assignment", icon: UserCheck },
] as const;

export function AssetTypesList() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {assetTypes.map((assetType) => (
        <Card key={assetType.id} className="bg-card border-border group">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="flex-1">
              <CardTitle className="text-base font-medium text-foreground">
                {assetType.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {assetType.description}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="mr-2 size-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Pencil className="mr-2 size-4" />
                  Edit Type
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 size-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {behaviorFlags.map((flag) => {
                const isEnabled = assetType[flag.key];
                const Icon = flag.icon;

                return (
                  <Badge
                    key={flag.key}
                    variant={isEnabled ? "default" : "outline"}
                    className={
                      isEnabled
                        ? "bg-primary/20 text-primary border-primary/30"
                        : "bg-secondary text-muted-foreground border-border"
                    }
                  >
                    <Icon className="mr-1 size-3" />
                    {flag.label}
                  </Badge>
                );
              })}
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Properties</span>
                <span className="font-medium text-foreground">
                  {assetType.properties.length}
                </span>
              </div>
              {assetType.properties.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {assetType.properties.slice(0, 4).map((prop) => (
                    <Badge
                      key={prop.id}
                      variant="secondary"
                      className="text-xs bg-secondary text-muted-foreground"
                    >
                      {prop.name}
                    </Badge>
                  ))}
                  {assetType.properties.length > 4 && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-secondary text-muted-foreground"
                    >
                      +{assetType.properties.length - 4} more
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
              <span>
                Created{" "}
                {assetType.createdAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <Button variant="ghost" size="sm" className="h-auto py-1 text-primary">
                View assets
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
