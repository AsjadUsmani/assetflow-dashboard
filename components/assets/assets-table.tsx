"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  ArrowLeftRight,
  UserPlus,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ListPagination } from "../list-pagination";
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
import { assetStatusConfig, type Asset } from "@/lib/services/assets";
import type { PaginationState } from "@/lib/services/pagination";
import { deleteAsset } from "@/lib/services/assets";

export function AssetsTable({
  assets,
  loading,
  error,
  onRefresh,
  pagination,
  onPageChange,
  onLimitChange,
}: {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  pagination?: PaginationState | null;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const router = useRouter();

  const toggleSelectAll = () => {
    if (selectedIds.length === assets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(assets.map((a) => a.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this asset?")) return;
    try {
      await deleteAsset(id);
      onRefresh();
    } catch {
      // ignore
    }
  };

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={assets.length > 0 && selectedIds.length === assets.length}
                  onCheckedChange={toggleSelectAll}
                  disabled={assets.length === 0}
                />
              </TableHead>
              <TableHead className="text-muted-foreground">Host Name</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Location</TableHead>
              <TableHead className="text-muted-foreground">Department</TableHead>
              <TableHead className="text-muted-foreground">Assigned To</TableHead>
              <TableHead className="text-muted-foreground w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No assets found.
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => {
                const status = assetStatusConfig[asset.status] ?? { label: asset.status, className: "" };
                return (
                  <TableRow key={asset.id} className="border-border">
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(asset.id)}
                        onCheckedChange={() => toggleSelect(asset.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/assets/${asset.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {asset.host_name || asset.name}
                      </Link>
                      {asset.serial_number && (
                        <p className="text-xs text-muted-foreground">{asset.serial_number}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {asset.asset_type_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={status.className}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {asset.location_name ?? "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {asset.department_name ?? "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {asset.assigned_to_username ?? asset.assigned_to_name ?? "-"}
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
                          <DropdownMenuItem asChild>
                            <Link href={`/assets/${asset.id}/edit`}>
                              <Pencil className="mr-2 size-4" />
                              Edit Asset
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/assets/${asset.id}/edit?tab=assignment&action=transfer`)}>
                            <ArrowLeftRight className="mr-2 size-4" />
                            Transfer Asset
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/assets/${asset.id}/edit?tab=assignment&action=assign`)}>
                            <UserPlus className="mr-2 size-4" />
                            Assign User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(asset.id)}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete Asset
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {!loading && assets.length > 0 && (
          onPageChange && pagination ? (
            <ListPagination
              pagination={pagination}
              label="assets"
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
            />
          ) : (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <div className="text-sm text-muted-foreground">
                {selectedIds.length > 0 ? (
                  <span>{selectedIds.length} of {assets.length} selected</span>
                ) : (
                  <span>Showing {assets.length} assets</span>
                )}
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
