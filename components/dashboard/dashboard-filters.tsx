"use client";

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
import { locations, departments, assetTypes } from "@/lib/mock-data";
import { useState } from "react";

interface FilterState {
  location: string;
  department: string;
  assetType: string;
  dateRange: string;
}

export function DashboardFilters() {
  const [filters, setFilters] = useState<FilterState>({
    location: "",
    department: "",
    assetType: "",
    dateRange: "30d",
  });

  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => value && key !== "dateRange"
  );

  const clearFilter = (key: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
  };

  const clearAllFilters = () => {
    setFilters({
      location: "",
      department: "",
      assetType: "",
      dateRange: "30d",
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
          value={filters.location}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, location: value }))
          }
        >
          <SelectTrigger className="w-40 bg-secondary border-0">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.department}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, department: value }))
          }
        >
          <SelectTrigger className="w-40 bg-secondary border-0">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.assetType}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, assetType: value }))
          }
        >
          <SelectTrigger className="w-40 bg-secondary border-0">
            <SelectValue placeholder="Asset Type" />
          </SelectTrigger>
          <SelectContent>
            {assetTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.dateRange}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, dateRange: value }))
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
              label = locations.find((l) => l.id === value)?.name || value;
            } else if (key === "department") {
              label = departments.find((d) => d.id === value)?.name || value;
            } else if (key === "assetType") {
              label = assetTypes.find((t) => t.id === value)?.name || value;
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
                  onClick={() => clearFilter(key as keyof FilterState)}
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
