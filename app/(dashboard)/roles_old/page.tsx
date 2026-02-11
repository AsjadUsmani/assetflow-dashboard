import { AppHeader } from "@/components/app-header";
import { RolesList } from "@/components/roles/roles-list";

export default function RolesPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Roles & Permissions" },
        ]}
      />
      <main className="flex-1 overflow-auto">
        <div className="container py-6 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Roles & Permissions
            </h1>
            <p className="text-muted-foreground">
              Manage role-based access controls for your organization
            </p>
          </div>
          <RolesList />
        </div>
      </main>
    </>
  );
}
