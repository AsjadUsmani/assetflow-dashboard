"use client";

import { useState } from "react";
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
import { locations, departments } from "@/lib/mock-data";

export function MovementsFilters() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    fromLocation: "",
    toLocation: "",
    dateRange: "30d",
  });

  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => value && key !== "dateRange"
  );

  const clearFilter = (key: string) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: "",
      fromLocation: "",
      toLocation: "",
      dateRange: "30d",
    });
    setSearch("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by asset name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-0"
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, status: value }))
          }
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
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, fromLocation: value }))
          }
        >
          <SelectTrigger className="w-40 bg-secondary border-0">
            <SelectValue placeholder="From Location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.toLocation}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, toLocation: value }))
          }
        >
          <SelectTrigger className="w-40 bg-secondary border-0">
            <SelectValue placeholder="To Location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
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

      {(activeFilters.length > 0 || search) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>

          {search && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 bg-primary/20 text-primary"
            >
              Search: {search}
              <Button
                variant="ghost"
                size="icon"
                className="size-4 p-0 hover:bg-transparent"
                onClick={() => setSearch("")}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          )}

          {activeFilters.map(([key, value]) => {
            let label = value;
            if (key === "fromLocation" || key === "toLocation") {
              label = locations.find((l) => l.id === value)?.name || value;
            }

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
                  onClick={() => clearFilter(key)}
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
