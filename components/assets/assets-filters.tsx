"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X, Download, Upload } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { locations, departments, assetTypes } from "@/lib/mock-data";

export function AssetsFilters() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    location: "",
    department: "",
    assetType: "",
  });

  const activeFilters = Object.entries(filters).filter(([_, value]) => value);

  const clearFilter = (key: string) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: "",
      status: "",
      location: "",
      department: "",
      assetType: "",
    });
    setSearch("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assets by name, serial number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-0"
          />
        </div>

        <Select
          value={filters.category}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, category: value }))
          }
        >
          <SelectTrigger className="w-36 bg-secondary border-0">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="physical">Physical</SelectItem>
            <SelectItem value="digital">Digital</SelectItem>
            <SelectItem value="consumable">Consumable</SelectItem>
            <SelectItem value="rechargeable">Rechargeable</SelectItem>
          </SelectContent>
        </Select>

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
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_maintenance">In Maintenance</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>

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
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
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

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 size-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm">
            <Upload className="mr-2 size-4" />
            Import
          </Button>
        </div>
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
            if (key === "location") {
              label = locations.find((l) => l.id === value)?.name || value;
            } else if (key === "department") {
              label = departments.find((d) => d.id === value)?.name || value;
            } else if (key === "assetType") {
              label = assetTypes.find((t) => t.id === value)?.name || value;
            } else {
              label = value.replace("_", " ");
            }

            return (
              <Badge
                key={key}
                variant="secondary"
                className="gap-1 pr-1 bg-primary/20 text-primary capitalize"
              >
                {key}: {label}
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
