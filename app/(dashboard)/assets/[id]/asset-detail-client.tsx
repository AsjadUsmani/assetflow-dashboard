"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Trash2, MapPin, Building2, User } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { assetStatusConfig, getAssetById } from "@/lib/services/assets";
import { deleteAsset } from "@/lib/services/assets";
import type { Asset } from "@/lib/services/assets";

function formatDate(s: string | null): string {
  if (!s) return "-";
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function AssetDetailClient() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? Number(params.id) : NaN;
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(id)) {
      setLoading(false);
      setError("Invalid id");
      return;
    }
    getAssetById(id)
      .then(setAsset)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!asset || !confirm("Delete this asset?")) return;
    try {
      await deleteAsset(asset.id);
      router.push("/assets");
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader breadcrumbs={[{ label: "Home", href: "/" }, { label: "Assets", href: "/assets" }, { label: "..." }]} />
        <div className="flex flex-1 flex-col gap-6 p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </>
    );
  }
  if (error || !asset) {
    return (
      <>
        <AppHeader breadcrumbs={[{ label: "Home", href: "/" }, { label: "Assets", href: "/assets" }]} />
        <div className="flex flex-1 flex-col gap-6 p-6">
          <p className="text-destructive">{error ?? "Asset not found."}</p>
          <Button asChild variant="outline">
            <Link href="/assets">Back to Assets</Link>
          </Button>
        </div>
      </>
    );
  }

  const status = assetStatusConfig[asset.status] ?? { label: asset.status, className: "" };

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Assets", href: "/assets" },
          { label: asset.host_name || asset.name },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{asset.host_name || asset.name}</h1>
              <Badge variant="outline" className={status.className}>
                {status.label}
              </Badge>
            </div>
            {asset.serial_number && <p className="text-muted-foreground">Serial: {asset.serial_number}</p>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/assets/${asset.id}/edit`}>
                <Pencil className="mr-2 size-4" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 size-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base font-medium">Asset Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Asset Type</p>
                    <p className="font-medium text-foreground">{asset.asset_type_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="outline" className={status.className}>
                      {status.label}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Serial Number</p>
                    <p className="font-medium text-foreground">{asset.serial_number ?? "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Designation</p>
                    <p className="font-medium text-foreground">{asset.designation_name ?? "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Brand / Model</p>
                    <p className="font-medium text-foreground">{asset.brand ?? "-"} / {asset.model_name ?? "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Created At</p>
                    <p className="font-medium text-foreground">{formatDate(asset.created_at)}</p>
                  </div>
                </div>
                {asset.property_values && Object.keys(asset.property_values).length > 0 && (
                  <>
                    <hr className="border-border" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Properties</p>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(asset.property_values).map(([key, value]) => (
                          <div key={key} className="space-y-1">
                            <p className="text-sm text-muted-foreground">{key}</p>
                            <p className="font-medium text-foreground">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base font-medium">Location & Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span className="text-foreground">{asset.location_name ?? "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="size-4 text-muted-foreground" />
                  <span className="text-foreground">{asset.department_name ?? "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="size-4 text-muted-foreground" />
                  <span className="text-foreground">{asset.assigned_to_username ?? asset.assigned_to_name ?? "Unassigned"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="size-4 text-muted-foreground" />
                  <span className="text-foreground">Created by: {asset.created_by_name ?? "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="size-4 text-muted-foreground" />
                  <span className="text-foreground">Updated by: {asset.updated_by_name ?? "-"}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base font-medium">Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Purchase: {formatDate(asset.purchase_date)}</p>
                <p>Warranty end: {formatDate(asset.warranty_end_date)}</p>
                <p>Expiry: {formatDate(asset.expiry_date)}</p>
                <p>Return date: {formatDate(asset.return_date)}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
