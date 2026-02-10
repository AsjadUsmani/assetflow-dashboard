import { AppHeader } from "@/components/app-header";
import { PropertyBuilderList } from "@/components/property-builder/property-builder-list";
import { PropertyDialog } from "@/components/property-builder/property-dialog";

export default function PropertyBuilderPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Property Builder" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              Property Builder
            </h1>
            <p className="text-muted-foreground">
              Create reusable properties for asset types
            </p>
          </div>
          <PropertyDialog />
        </div>

        <PropertyBuilderList />
      </div>
    </>
  );
}
