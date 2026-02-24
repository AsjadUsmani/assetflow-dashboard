"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { AssetTypesList } from "@/components/asset-types/asset-types-list";
import { AssetTypeDialog } from "@/components/asset-types/asset-type-dialog";

export default function AssetTypesPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAssetTypeCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

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
              Configure asset categories and their behavior flags
            </p>
          </div>
          <AssetTypeDialog onSuccess={handleAssetTypeCreated} />
        </div>

        <AssetTypesList key={refreshKey} />
      </div>
    </>
  );
}
