"use client";

import type { Dispatch, SetStateAction } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { AssetsFiltersState } from "./assets-view";
import type { AssetType } from "@/lib/services/asset-types";
import type { Location } from "@/lib/services/locations";
import type { Department } from "@/lib/services/departments";

export function AssetsFilters({
  filters,
  onFiltersChange,
  assetTypes,
  locations,
  departments,
}: {
  filters: AssetsFiltersState;
  onFiltersChange: Dispatch<SetStateAction<AssetsFiltersState>>;
  assetTypes: AssetType[];
  locations: Location[];
  departments: Department[];
}) {
  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => key !== "search" && Boolean(value),
  );

  const clearFilter = (key: keyof AssetsFiltersState) => {
    onFiltersChange((prev) => ({ ...prev, [key]: "" }));
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      status: "",
      location: "",
      department: "",
      assetType: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assets by host name, serial number..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange((prev) => ({ ...prev, search: e.target.value }))
            }
            className="pl-9 bg-secondary border-0"
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFiltersChange((prev) => ({ ...prev, status: value }))
          }
        >
          <SelectTrigger className="w-36 bg-secondary border-0">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_maintenance">In Maintenance</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="pending_disposal">Pending for Disposal</SelectItem>
            <SelectItem value="disposed">Disposed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.location}
          onValueChange={(value) =>
            onFiltersChange((prev) => ({ ...prev, location: value }))
          }
        >
          <SelectTrigger className="w-40 bg-secondary border-0">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={String(loc.id)}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.department}
          onValueChange={(value) =>
            onFiltersChange((prev) => ({ ...prev, department: value }))
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
          value={filters.assetType}
          onValueChange={(value) =>
            onFiltersChange((prev) => ({ ...prev, assetType: value }))
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

        
      </div>

      {(activeFilters.length > 0 || filters.search) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {filters.search && (
            <Badge variant="secondary" className="gap-1 pr-1 bg-primary/20 text-primary">
              Search: {filters.search}
              <Button
                variant="ghost"
                size="icon"
                className="size-4 p-0 hover:bg-transparent"
                onClick={() => onFiltersChange((prev) => ({ ...prev, search: "" }))}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          )}
          {activeFilters.map(([key, value]) => {
            let label: string = String(value);
            if (key === "location") {
              label = locations.find((l) => String(l.id) === value)?.name ?? value;
            } else if (key === "department") {
              label = departments.find((d) => String(d.id) === value)?.name ?? value;
            } else if (key === "assetType") {
              label = assetTypes.find((t) => String(t.id) === value)?.name ?? value;
            } else {
              label = String(value).replace("_", " ");
            }
            return (
              <Badge key={key} variant="secondary" className="gap-1 pr-1 bg-primary/20 text-primary capitalize">
                {key}: {label}
                <Button variant="ghost" size="icon" className="size-4 p-0 hover:bg-transparent" onClick={() => clearFilter(key as keyof AssetsFiltersState)}>
                  <X className="size-3" />
                </Button>
              </Badge>
            );
          })}
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground hover:text-foreground h-auto py-1">
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
