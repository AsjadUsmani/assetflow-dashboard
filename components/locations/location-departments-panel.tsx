"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Mail,
  Phone,
  Plus,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LocationDepartment } from "@/lib/services/locations";

type LocationDepartmentsPanelProps = {
  locationId: string;
  locationName: string;
  departments: LocationDepartment[];
};

export function LocationDepartmentsPanel({
  locationId,
  locationName,
  departments,
}: LocationDepartmentsPanelProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.code?.toLowerCase().includes(q) ?? false) ||
        (d.phone?.toLowerCase().includes(q) ?? false) ||
        (d.email?.toLowerCase().includes(q) ?? false),
    );
  }, [departments, search]);

  const withContact = departments.filter((d) => d.phone || d.email).length;
  const totalAssets = departments.reduce((sum, d) => sum + d.assets_count, 0);

  if (departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-14 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <Building2 className="size-7 text-primary" />
        </div>
        <p className="text-base font-medium">No departments at this venue</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Link departments that operate at {locationName} to manage venue-specific contact details.
        </p>
        <Button className="mt-6" asChild>
          <Link href={`/departments/new?location_id=${locationId}`}>
            <Plus className="mr-2 size-4" />
            Link first department
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            {departments.length} departments
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-xs">
            {withContact} with contact
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-xs">
            {totalAssets} assets
          </Badge>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/departments/new?location_id=${locationId}`}>
            <Plus className="mr-2 size-4" />
            Link department
          </Link>
        </Button>
      </div>

      {departments.length > 5 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or email..."
            className="h-10 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      <ScrollArea className="h-[min(32rem,60vh)] pr-4">
        <ul className="space-y-3">
          {filtered.length === 0 ? (
            <li className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
              No departments match your search.
            </li>
          ) : (
            filtered.map((dept) => (
              <li
                key={dept.id}
                className="rounded-xl border bg-background p-4 shadow-sm transition-colors hover:border-primary/20 hover:bg-muted/20 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/departments/${dept.id}`}
                      className="text-base font-semibold leading-tight hover:text-primary hover:underline"
                    >
                      {dept.name}
                    </Link>
                    {dept.code ? (
                      <p className="mt-1 text-xs text-muted-foreground">{dept.code}</p>
                    ) : null}
                  </div>
                  <Badge variant="secondary" className="shrink-0 tabular-nums">
                    {dept.assets_count} asset{dept.assets_count !== 1 ? "s" : ""}
                  </Badge>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-muted/40 px-3 py-2.5">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Phone className="size-3" />
                      Phone extension
                    </p>
                    <p className="text-sm text-foreground">
                      {dept.phone ?? (
                        <span className="text-muted-foreground/70">Not configured</span>
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/40 px-3 py-2.5">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Mail className="size-3" />
                      Email
                    </p>
                    {dept.email ? (
                      <a
                        href={`mailto:${dept.email}`}
                        className="block truncate text-sm text-primary hover:underline"
                      >
                        {dept.email}
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground/70">Not configured</p>
                    )}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </ScrollArea>

      {search.trim() && filtered.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Showing {filtered.length} of {departments.length} departments
        </p>
      )}
    </div>
  );
}
