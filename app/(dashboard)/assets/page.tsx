import { AppHeader } from "@/components/app-header";
import { AssetsTable } from "@/components/assets/assets-table";
import { AssetsFilters } from "@/components/assets/assets-filters";
import { CreateAssetDialog } from "@/components/assets/create-asset-dialog";

export default function AssetsPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Assets" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              Assets
            </h1>
            <p className="text-muted-foreground">
              View and manage all organizational assets
            </p>
          </div>
          <CreateAssetDialog />
        </div>

        <AssetsFilters />
        <AssetsTable />
      </div>
    </>
  );
}
