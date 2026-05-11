"use client";

import { useState, useCallback } from "react";
import { AppHeader } from "@/components/app-header";
import { AssetTypesList } from "@/components/asset-types/asset-types-list";
import { AssetTypeDialog } from "@/components/asset-types/asset-type-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown, Upload, Download, ChevronDown } from "lucide-react";
import { apiService } from "@/lib/services/api-service";
import { useToast } from "@/components/ui/use-toast";
import { ImportCsvDialog } from "@/components/import-csv-dialog";

export default function AssetTypesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAssetTypeCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleDownloadSampleCsv = useCallback(async () => {
    try {
      const blob = await apiService.getFile("/workspace/asset-types/sample-csv");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "asset-types-sample.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Download started", description: "asset-types-sample.csv" });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }, [toast]);

  const handleExportCsv = useCallback(async () => {
    try {
      const blob = await apiService.getFile("/workspace/asset-types/export-csv");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "asset-types-export.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export started", description: "asset-types-export.csv" });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }, [toast]);

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Asset Types" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              Asset Types
            </h1>
            <p className="text-muted-foreground">
              Configure asset categories
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu modal={false}>
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
                <DropdownMenuItem onClick={handleExportCsv}>
                  <Download className="mr-2 size-4" />
                  Export to CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <AssetTypeDialog onSuccess={handleAssetTypeCreated} />
          </div>
        </div>

        <ImportCsvDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          endpoint="/workspace/asset-types/import-csv"
          title="Import asset types from CSV"
          description="Upload a CSV with columns: name, description, has_expiry, is_rechargeable, is_one_time_use, is_movable, requires_assignment. Download sample CSV for exact format."
          sampleFilename="asset-types-sample.csv"
          onSuccess={handleAssetTypeCreated}
        />

        <AssetTypesList key={refreshKey} />
      </div>
    </>
  );
}
