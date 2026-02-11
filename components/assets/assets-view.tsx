"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { getAssets } from "@/lib/services/assets";
import { getAssetTypes } from "@/lib/services/asset-types";
import { getLocations } from "@/lib/services/locations";
import { getDepartments } from "@/lib/services/departments";
import type { Asset, ListAssetsQuery } from "@/lib/services/assets";
import type { AssetType } from "@/lib/services/asset-types";
import type { Location } from "@/lib/services/locations";
import type { Department } from "@/lib/services/departments";
import { apiService } from "@/lib/services/api-service";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown, Upload, ChevronDown } from "lucide-react";
import { AssetsFilters } from "./assets-filters";
import { AssetsTable } from "./assets-table";
import { CreateAssetDialog } from "./create-asset-dialog";
import { ImportCsvDialog } from "@/components/import-csv-dialog";

export type AssetsFiltersState = {
  status: string;
  location: string;
  department: string;
  assetType: string;
};

const emptyFilters: AssetsFiltersState = {
  status: "",
  location: "",
  department: "",
  assetType: "",
};

export function AssetsView() {
  const searchParams = useSearchParams();
  const assetTypeFromUrl = searchParams.get("assetType") ?? "";

  const [filters, setFilters] = React.useState<AssetsFiltersState>(() => ({
    ...emptyFilters,
    assetType: assetTypeFromUrl,
  }));
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [assetTypes, setAssetTypes] = React.useState<AssetType[]>([]);
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleDownloadSampleCsv = React.useCallback(async () => {
    try {
      const blob = await apiService.getFile("/workspace/assets/sample-csv");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "assets-sample.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Download started", description: "assets-sample.csv" });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }, [toast]);

  const loadOptions = React.useCallback(async () => {
    try {
      const [types, locs, depts] = await Promise.all([
        getAssetTypes(),
        getLocations(),
        getDepartments(),
      ]);
      setAssetTypes(types);
      setLocations(locs);
      setDepartments(depts);
    } catch {
      // keep previous
    }
  }, []);

  const loadAssets = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const query: ListAssetsQuery = {};
    if (filters.assetType) query.assetType = Number(filters.assetType);
    if (filters.status) query.status = filters.status;
    if (filters.location) query.location = Number(filters.location);
    if (filters.department) query.department = Number(filters.department);
    try {
      const data = await getAssets(query);
      setAssets(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load assets");
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [filters.assetType, filters.status, filters.location, filters.department]);

  React.useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  React.useEffect(() => {
    if (assetTypeFromUrl && filters.assetType !== assetTypeFromUrl) {
      setFilters((prev) => ({ ...prev, assetType: assetTypeFromUrl }));
    }
  }, [assetTypeFromUrl]);

  React.useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Assets</h1>
          <p className="text-muted-foreground">View and manage all organizational assets</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                CSV
                <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownloadSampleCsv}>
                <FileDown className="mr-2 size-4" />
                Download sample CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                <Upload className="mr-2 size-4" />
                Import from CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <CreateAssetDialog onSuccess={loadAssets} />
        </div>
      </div>
      <ImportCsvDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        endpoint="/workspace/assets/import-csv"
        title="Import assets from CSV"
        description="Upload a CSV with columns: asset_type_id (or asset_type_name), name, serial_number, status, location_id, department_id, purchase_date, warranty_end_date, expiry_date. Download the sample for the exact format."
        sampleFilename="assets-sample.csv"
        onSuccess={loadAssets}
      />
      <AssetsFilters
        filters={filters}
        onFiltersChange={setFilters}
        assetTypes={assetTypes}
        locations={locations}
        departments={departments}
      />
      <AssetsTable
        assets={assets}
        loading={loading}
        error={error}
        onRefresh={loadAssets}
      />
    </>
  );
}
