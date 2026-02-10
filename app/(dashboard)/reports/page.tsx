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
      <main className="flex-1 overflow-auto">
        <div className="container py-6 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Generate and download comprehensive asset reports
            </p>
          </div>
          <ReportsGrid />
        </div>
      </main>
    </>
  );
}
