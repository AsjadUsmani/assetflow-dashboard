import { AppHeader } from "@/components/app-header";
import { AuditLogsList } from "@/components/audit-logs/audit-logs-list";

export default function AuditLogsPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Audit Logs" },
        ]}
      />
      <main className="flex-1 overflow-auto">
        <div className="container py-6 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
            <p className="text-muted-foreground">
              Track all system activities and changes for compliance
            </p>
          </div>
          <AuditLogsList />
        </div>
      </main>
    </>
  );
}
