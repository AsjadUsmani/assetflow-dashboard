"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  ArrowLeftRight,
  UserPlus,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { assets, locations, departments, users } from "@/lib/mock-data";

const statusConfig = {
  available: { label: "Available", className: "bg-success/20 text-success border-success/30" },
  assigned: { label: "Assigned", className: "bg-primary/20 text-primary border-primary/30" },
  in_maintenance: { label: "In Maintenance", className: "bg-warning/20 text-warning border-warning/30" },
  retired: { label: "Retired", className: "bg-muted text-muted-foreground border-border" },
  lost: { label: "Lost", className: "bg-destructive/20 text-destructive border-destructive/30" },
};

const categoryConfig = {
  physical: { label: "Physical", className: "bg-chart-1/20 text-chart-1" },
  digital: { label: "Digital", className: "bg-chart-2/20 text-chart-2" },
  consumable: { label: "Consumable", className: "bg-chart-3/20 text-chart-3" },
  rechargeable: { label: "Rechargeable", className: "bg-chart-4/20 text-chart-4" },
};

export function AssetsTable() {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedAssets.length === assets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(assets.map((a) => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedAssets.length === assets.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="text-muted-foreground">Asset Name</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Category</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Location</TableHead>
              <TableHead className="text-muted-foreground">Department</TableHead>
              <TableHead className="text-muted-foreground">Assigned To</TableHead>
              <TableHead className="text-muted-foreground w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => {
              const status = statusConfig[asset.status];
              const category = categoryConfig[asset.category];
              const location = locations.find((l) => l.id === asset.locationId);
              const department = departments.find((d) => d.id === asset.departmentId);
              const assignedUser = asset.assignedToId
                ? users.find((u) => u.id === asset.assignedToId)
                : null;

              return (
                <TableRow key={asset.id} className="border-border">
                  <TableCell>
                    <Checkbox
                      checked={selectedAssets.includes(asset.id)}
                      onCheckedChange={() => toggleSelect(asset.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/assets/${asset.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {asset.name}
                    </Link>
                    {asset.serialNumber && (
                      <p className="text-xs text-muted-foreground">
                        {asset.serialNumber}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {asset.assetType.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={category.className}>
                      {category.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={status.className}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {location?.name || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {department?.name || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {assignedUser?.name || "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/assets/${asset.id}`}>
                            <Eye className="mr-2 size-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 size-4" />
                          Edit Asset
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <ArrowLeftRight className="mr-2 size-4" />
                          Transfer Asset
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserPlus className="mr-2 size-4" />
                          Assign User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 size-4" />
                          Delete Asset
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <div className="text-sm text-muted-foreground">
            {selectedAssets.length > 0 ? (
              <span>{selectedAssets.length} of {assets.length} selected</span>
            ) : (
              <span>Showing {assets.length} assets</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="mr-1 size-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="secondary" size="sm" className="size-8 p-0">
                1
              </Button>
              <Button variant="ghost" size="sm" className="size-8 p-0">
                2
              </Button>
              <Button variant="ghost" size="sm" className="size-8 p-0">
                3
              </Button>
            </div>
            <Button variant="outline" size="sm">
              Next
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
