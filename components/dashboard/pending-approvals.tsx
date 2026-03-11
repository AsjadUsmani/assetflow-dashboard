"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRightLeft,
  Trash2,
  DollarSign,
  Clock,
  ChevronRight,
  AlertCircle,
  Plus,
  Package,
  UserPlus,
  Wrench,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRequests, type AssetRequest } from "@/lib/services/requests";
import { getAssets } from "@/lib/services/assets";
import {
  isInDateRange,
  type DashboardFilterState,
} from "@/components/dashboard/filters";

const getRequestIcon = (type: string) => {
  switch (type) {
    case "create":
      return Plus;
    case "assign":
      return UserPlus;
    case "transfer":
      return ArrowRightLeft;
    case "dispose":
      return Trash2;
    case "buyback":
      return DollarSign;
    case "maintenance":
      return Wrench;
    case "return":
      return RotateCcw;
    default:
      return Package;
  }
};

const getLevelColor = (level: string | null) => {
  switch (level) {
    case "location":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "regional":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "ho":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    default:
      return "bg-secondary text-muted-foreground";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "text-red-400";
    case "high":
      return "text-amber-400";
    default:
      return "text-muted-foreground";
  }
};

export function PendingApprovals({ filters }: { filters: DashboardFilterState }) {
  const [requests, setRequests] = useState<AssetRequest[]>([]);

  useEffect(() => {
    const location = filters.location ? Number(filters.location) : undefined;
    const department = filters.department ? Number(filters.department) : undefined;
    const assetType = filters.assetType ? Number(filters.assetType) : undefined;

    let isMounted = true;
    (async () => {
      try {
        const [data, filteredAssets] = await Promise.all([
          getRequests(),
          getAssets({ location, department, assetType }),
        ]);
        if (!isMounted) return;
        const filteredAssetIds = new Set(filteredAssets.map((asset) => asset.id));
        const hasAssetFilter = Boolean(location || department || assetType);
        setRequests(
          data.filter((request) => {
            if (!isInDateRange(request.created_at, filters.dateRange)) return false;
            if (request.asset_id == null) return !hasAssetFilter;
            return filteredAssetIds.has(request.asset_id);
          }),
        );
      } catch {
        // swallow; global error handler can surface toast separately
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  const pendingRequests = requests.filter((req) =>
    ["pending", "in_review"].includes(req.status)
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertCircle className="size-4" />
            Pending Approvals
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {pendingRequests.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {pendingRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary mb-3">
              <Clock className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((request) => {
              const Icon = getRequestIcon(request.type);
              const assetName = request.asset_name || "New Asset";
              const requesterName = request.requested_by_name || "Unknown";
              const daysAgo = Math.floor(
                (Date.now() - new Date(request.created_at).getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <Link
                  key={request.id}
                  href={`/requests/${request.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                >
                  <div
                    className={`flex size-10 items-center justify-center rounded-lg ${
                      request.priority === "urgent"
                        ? "bg-red-500/20"
                        : request.priority === "high"
                          ? "bg-amber-500/20"
                          : "bg-secondary"
                    }`}
                  >
                    <Icon
                      className={`size-4 ${getPriorityColor(request.priority)}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {assetName}
                      </p>
                      <Badge variant="outline" className="capitalize text-xs">
                        {request.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {request.request_number} • by {requesterName} •{" "}
                      {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${getLevelColor(request.current_approval_level)}`}
                    >
                      {request.current_approval_level === "ho"
                        ? "Head Office"
                        : request.current_approval_level}
                    </Badge>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <Button variant="ghost" className="w-full mt-3" asChild>
          <Link href="/requests">
            View all requests
            <ChevronRight className="ml-2 size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
