"use client";

import { useEffect, useState } from "react";
import { CalendarIcon, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getLocations, type Location } from "@/lib/services/locations";
import { getDepartments, type Department } from "@/lib/services/departments";
import { getAssetTypes, type AssetType } from "@/lib/services/asset-types";
import type { DashboardFilterState } from "./filters";

type DashboardFiltersProps = {
  value: DashboardFilterState;
  onChange: (value: DashboardFilterState) => void;
};

export function DashboardFilters({ value, onChange }: DashboardFiltersProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [locs, depts, types] = await Promise.all([
          getLocations(),
          getDepartments(),
          getAssetTypes(),
        ]);
        if (!isMounted) return;
        setLocations(locs);
        setDepartments(depts);
        setAssetTypes(types);
      } catch {
        // ignore; filters can degrade gracefully
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeFilters = Object.entries(value).filter(
    ([key, value]) => value && key !== "dateRange"
  );

  const clearFilter = (key: keyof DashboardFilterState) => {
    onChange({ ...value, [key]: "" });
  };

  const clearAllFilters = () => {
    onChange({
      location: "",
      department: "",
      assetType: "",
      dateRange: "all",
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="size-4" />
          <span>Filters</span>
        </div>

        <Select
          value={value.location}
          onValueChange={(selected) =>
            onChange({ ...value, location: selected })
          }
        >
          <SelectTrigger className="w-40 bg-secondary border-0">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location.id} value={String(location.id)}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.department}
          onValueChange={(selected) =>
            onChange({ ...value, department: selected })
          }
        >
          <SelectTrigger className="w-40 bg-secondary border-0">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={String(dept.id)}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.assetType}
          onValueChange={(selected) =>
            onChange({ ...value, assetType: selected })
          }
        >
          <SelectTrigger className="w-40 bg-secondary border-0">
            <SelectValue placeholder="Asset Type" />
          </SelectTrigger>
          <SelectContent>
            {assetTypes.map((type) => (
              <SelectItem key={type.id} value={String(type.id)}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.dateRange}
          onValueChange={(selected) =>
            onChange({ ...value, dateRange: selected })
          }
        >
          <SelectTrigger className="w-40 bg-secondary border-0">
            <CalendarIcon className="mr-2 size-4" />
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>

        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {activeFilters.map(([key, value]) => {
            let label = "";
            if (key === "location") {
              label = locations.find((l) => String(l.id) === value)?.name || value;
            } else if (key === "department") {
              label = departments.find((d) => String(d.id) === value)?.name || value;
            } else if (key === "assetType") {
              label = assetTypes.find((t) => String(t.id) === value)?.name || value;
            }

            return (
              <Badge
                key={key}
                variant="secondary"
                className="gap-1 pr-1 bg-primary/20 text-primary"
              >
                {label}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-4 p-0 hover:bg-transparent"
                  onClick={() => clearFilter(key as keyof DashboardFilterState)}
                >
                  <X className="size-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
