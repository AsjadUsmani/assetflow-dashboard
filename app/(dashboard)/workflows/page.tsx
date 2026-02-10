import { AppHeader } from "@/components/app-header";
import { WorkflowsList } from "@/components/workflows/workflows-list";
import { WorkflowFilters } from "@/components/workflows/workflow-filters";

export default function WorkflowsPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Workflows" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Transfer & Disposal Workflows
          </h1>
          <p className="text-muted-foreground">
            Manage asset transfer, disposal, and buyback requests through the approval pipeline
          </p>
        </div>

        <WorkflowFilters />
        <WorkflowsList />
      </div>
    </>
  );
}
