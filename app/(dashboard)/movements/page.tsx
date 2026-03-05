"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { MovementsTable } from "@/components/movements/movements-table";
import {
  MovementsFilters,
  type MovementsFiltersState,
} from "@/components/movements/movements-filters";
import { RequestMovementDialog } from "@/components/movements/request-movement-dialog";

export default function MovementsPage() {
  const [filters, setFilters] = useState<MovementsFiltersState>({
    search: "",
    status: "",
    fromLocation: "",
    toLocation: "",
    dateRange: "30d",
  });

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Asset Movements" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              Asset Movements
            </h1>
            <p className="text-muted-foreground">
              Track and approve asset transfers between locations, departments,
              and users
            </p>
          </div>
          <RequestMovementDialog />
        </div>

        <MovementsFilters filters={filters} onFiltersChange={setFilters} />
        <MovementsTable filters={filters} />
      </div>
    </>
  );
}
