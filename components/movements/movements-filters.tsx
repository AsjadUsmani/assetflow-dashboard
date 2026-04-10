"use client";

import { useEffect, useMemo, useState } from "react";
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
import { getLocations, type Location } from "@/lib/services/locations";

export type MovementsFiltersState = {
  search: string;
  status: string;
  fromLocation: string;
  toLocation: string;
  dateRange: string;
};

export function MovementsFilters({
  filters,
  onFiltersChange,
}: {
  filters: MovementsFiltersState;
  onFiltersChange: (next: MovementsFiltersState) => void;
}) {
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const locs = await getLocations();
        if (!isMounted) return;
        setLocations(locs);
      } catch {
        // ignore; filters still usable without locations
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    return Boolean(value) && key !== "dateRange" && key !== "search";
  });

  const setFilter = (key: keyof MovementsFiltersState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: key === "dateRange" && !value ? "all" : value,
    });
  };

  const clearFilter = (key: keyof MovementsFiltersState) => {
    setFilter(key, "");
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      status: "",
      fromLocation: "",
      toLocation: "",
      dateRange: "all",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by asset name..."
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            className="pl-9 bg-secondary border-0"
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value) => setFilter("status", value)}
        >
          <SelectTrigger className="w-36 bg-secondary border-0">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.fromLocation}
          onValueChange={(value) => setFilter("fromLocation", value)}
        >
          <SelectTrigger className="w-40 bg-secondary border-0">
            <SelectValue placeholder="From Location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.name}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.toLocation}
          onValueChange={(value) => setFilter("toLocation", value)}
        >
          <SelectTrigger className="w-40 bg-secondary border-0">
            <SelectValue placeholder="To Location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.name}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.dateRange}
          onValueChange={(value) => setFilter("dateRange", value)}
        >
          <SelectTrigger className="w-36 bg-secondary border-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(activeFilters.length > 0 || filters.search) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>

          {filters.search && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 bg-primary/20 text-primary"
            >
              Search: {filters.search}
              <Button
                variant="ghost"
                size="icon"
                className="size-4 p-0 hover:bg-transparent"
                onClick={() => setFilter("search", "")}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          )}

          {activeFilters.map(([key, value]) => {
            let label = value;

            return (
              <Badge
                key={key}
                variant="secondary"
                className="gap-1 pr-1 bg-primary/20 text-primary capitalize"
              >
                {key.replace(/([A-Z])/g, " $1").trim()}: {label}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-4 p-0 hover:bg-transparent"
                  onClick={() => clearFilter(key as keyof MovementsFiltersState)}
                >
                  <X className="size-3" />
                </Button>
              </Badge>
            );
          })}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground h-auto py-1"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
