"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { AssetsByCategory } from "@/components/dashboard/assets-by-category";
import { AssetsByLocation } from "@/components/dashboard/assets-by-location";
import { StockOverview } from "@/components/dashboard/stock-overview";
import {
  defaultDashboardFilters,
  type DashboardFilterState,
  getDateRangeStart,
} from "@/components/dashboard/filters";
import { getAssets, type Asset } from "@/lib/services/assets";
import { getRequests, type AssetRequest } from "@/lib/services/requests";
import { getLocations, type Location } from "@/lib/services/locations";
import { getDepartments, type Department } from "@/lib/services/departments";
import { getAssetTypes, type AssetType } from "@/lib/services/asset-types";

const DASHBOARD_FILTERS_STORAGE_KEY = "dashboard_filters";
const VALID_DATE_RANGES = new Set(["7d", "30d", "90d", "1y", "all"]);

function sanitizeFilters(value: unknown): DashboardFilterState {
  if (!value || typeof value !== "object") return defaultDashboardFilters;
  const obj = value as Partial<DashboardFilterState>;
  const dateRange = VALID_DATE_RANGES.has(obj.dateRange ?? "")
    ? (obj.dateRange as DashboardFilterState["dateRange"])
    : defaultDashboardFilters.dateRange;

  return {
    location: typeof obj.location === "string" ? obj.location : "",
    department: typeof obj.department === "string" ? obj.department : "",
    assetType: typeof obj.assetType === "string" ? obj.assetType : "",
    dateRange,
  };
}

export default function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilterState>(defaultDashboardFilters);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [allRequests, setAllRequests] = useState<AssetRequest[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  // Load persisted filters from localStorage once on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DASHBOARD_FILTERS_STORAGE_KEY);
      if (!raw) return;
      setFilters(sanitizeFilters(JSON.parse(raw)));
    } catch {
      // ignore corrupted storage
    }
  }, []);

  // Persist filters whenever they change
  useEffect(() => {
    try {
      window.localStorage.setItem(DASHBOARD_FILTERS_STORAGE_KEY, JSON.stringify(filters));
    } catch {
      // ignore write failures
    }
  }, [filters]);

  const [isReferenceLoading, setIsReferenceLoading] = useState(true);
  const [isAssetsLoading, setIsAssetsLoading] = useState(true);

  // Load reference data ONCE on mount.
  useEffect(() => {
    let isMounted = true;
    setIsReferenceLoading(true);

    Promise.all([
      getRequests(),
      getLocations(),
      getDepartments(),
      getAssetTypes(),
    ])
      .then(([requestsData, locationsData, departmentsData, assetTypesData]) => {
        if (!isMounted) return;
        setAllRequests(requestsData);
        setLocations(locationsData);
        setDepartments(departmentsData);
        setAssetTypes(assetTypesData);
      })
      .catch(() => {
        // silently degrade
      })
      .finally(() => {
        if (isMounted) setIsReferenceLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch assets ONCE on mount
  useEffect(() => {
    let isMounted = true;
    setIsAssetsLoading(true);

    getAssets()
      .then((assetsData) => {
        if (!isMounted) return;
        setAllAssets(assetsData);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsAssetsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Client-side filtering — no extra API calls
  const filteredAssets = useMemo(() => {
    let result = allAssets;

    if (filters.location) {
      result = result.filter((a) => String(a.location_id) === filters.location);
    }
    if (filters.department) {
      result = result.filter((a) => String(a.department_id) === filters.department);
    }
    if (filters.assetType) {
      result = result.filter((a) => String(a.asset_type_id) === filters.assetType);
    }

    const start = getDateRangeStart(filters.dateRange)?.getTime();
    if (start) {
      result = result.filter(
        (a) => a.created_at && new Date(a.created_at).getTime() >= start,
      );
    }

    return result;
  }, [allAssets, filters]);

  const filteredRequests = useMemo(() => {
    const start = getDateRangeStart(filters.dateRange)?.getTime();
    const assetIds = new Set(filteredAssets.map((a) => a.id));
    return allRequests.filter((r) => {
      if (start && r.created_at && new Date(r.created_at).getTime() < start) return false;
      if (r.asset_id == null) return true;
      return assetIds.has(r.asset_id);
    });
  }, [allRequests, filteredAssets, filters.dateRange]);

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

        <DashboardFilters 
          value={filters} 
          onChange={setFilters} 
          locations={locations}
          departments={departments}
          assetTypes={assetTypes}
        />

        {isReferenceLoading || isAssetsLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <DashboardStats
              filters={filters}
              filteredAssets={filteredAssets}
              filteredRequests={filteredRequests}
            />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="grid gap-6 md:grid-cols-2">
                  <AssetsByCategory filteredAssets={filteredAssets} />
                  <AssetsByLocation filteredAssets={filteredAssets} locations={locations} />
                </div>
              </div>
              {/* StockOverview shows ALL assets (unfiltered by date) for accurate inventory counts */}
              <StockOverview assets={allAssets} />
            </div>
          </>
        )}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* <RecentMovements filters={filters} /> */}
          </div>
          <div className="flex flex-col gap-6">
            {/* <PendingApprovals filters={filters} />
            <ExpiringAssets filters={filters} />
            <AlertsPanel filters={filters} /> */}
          </div>
        </div>
      </div>
    </>
  );
}
