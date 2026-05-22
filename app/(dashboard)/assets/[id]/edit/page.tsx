import { Suspense } from "react";
import { EditAssetClient } from "./edit-asset-client";

export default function EditAssetPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading...</div>}>
      <EditAssetClient />
    </Suspense>
  );
}
