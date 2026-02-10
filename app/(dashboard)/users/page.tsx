import { AppHeader } from "@/components/app-header";
import { UsersList } from "@/components/users/users-list";

export default function UsersPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Users" },
        ]}
      />
      <main className="flex-1 overflow-auto">
        <div className="container py-6 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage users, roles, and permissions across your organization
            </p>
          </div>
          <UsersList />
        </div>
      </main>
    </>
  );
}
