import { AppHeader } from "@/components/app-header";
import { AccountabilityList } from "@/components/accountability/accountability-list";

export default function AccountabilityPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Accountability" },
        ]}
      />
      <main className="flex-1 overflow-auto">
        <div className="container py-6 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Asset Accountability
            </h1>
            <p className="text-muted-foreground">
              Track asset assignments and manage accountability records
            </p>
          </div>
          <AccountabilityList />
        </div>
      </main>
    </>
  );
}
