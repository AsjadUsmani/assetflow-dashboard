import { AppHeader } from "@/components/app-header";
import { ReportsGrid } from "@/components/reports/reports-grid";

export default function ReportsPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Reports" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and download comprehensive asset reports
          </p>
        </div>
        <ReportsGrid />
      </div>
    </>
  );
}
