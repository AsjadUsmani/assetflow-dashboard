"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { AssetsByCategory } from "@/components/dashboard/assets-by-category";
import { AssetsByLocation } from "@/components/dashboard/assets-by-location";
import { RecentMovements } from "@/components/dashboard/recent-movements";
import { ExpiringAssets } from "@/components/dashboard/expiring-assets";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { StockOverview } from "@/components/dashboard/stock-overview";
import { PendingApprovals } from "@/components/dashboard/pending-approvals";
import {
  defaultDashboardFilters,
  type DashboardFilterState,
} from "@/components/dashboard/filters";

export default function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilterState>(defaultDashboardFilters);

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Dashboard" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Asset Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of all organizational assets and recent activity
          </p>
        </div>

        <DashboardFilters value={filters} onChange={setFilters} />

        <DashboardStats filters={filters} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="grid gap-6 md:grid-cols-2">
              <AssetsByCategory filters={filters} />
              <AssetsByLocation filters={filters} />
            </div>
          </div>
          <StockOverview filters={filters} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentMovements filters={filters} />
          </div>
          <div className="flex flex-col gap-6">
            <PendingApprovals filters={filters} />
            <ExpiringAssets filters={filters} />
            <AlertsPanel filters={filters} />
          </div>
        </div>
      </div>
    </>
  );
}
