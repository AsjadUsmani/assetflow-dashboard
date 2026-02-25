"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { getAssetById, updateAsset, type Asset, type UpdateAssetBody } from "@/lib/services/assets";
import { getAssetTypeById } from "@/lib/services/asset-types";
import { getLocations } from "@/lib/services/locations";
import { getDepartments } from "@/lib/services/departments";
import { getWorkspaceUsers } from "@/lib/services/workspace-users";
import type { AssetType } from "@/lib/services/asset-types";
import type { Location } from "@/lib/services/locations";
import type { Department } from "@/lib/services/departments";
import type { WorkspaceUser } from "@/lib/services/workspace-users";

function toDateInputValue(s: string | null): string {
  if (!s) return "";
  try {
    const d = new Date(s);
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export function EditAssetClient() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? "basic";
  const id = typeof params?.id === "string" ? Number(params.id) : NaN;
  const [asset, setAsset] = useState<Asset | null>(null);
  const [assetType, setAssetType] = useState<AssetType | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [status, setStatus] = useState("available");
  const [locationId, setLocationId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyEndDate, setWarrantyEndDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [propertyValues, setPropertyValues] = useState<Record<string, string | number | boolean>>({});

  useEffect(() => {
    if (Number.isNaN(id)) {
      setLoading(false);
      setError("Invalid id");
      return;
    }
    Promise.all([
      getAssetById(id),
      getLocations(),
      getDepartments(),
      getWorkspaceUsers(),
    ])
      .then(([a, locs, depts, usrs]) => {
        if (!a) {
          setError("Asset not found");
          return;
        }
        setAsset(a);
        setLocations(locs);
        setDepartments(depts);
        setUsers(usrs);
        setName(a.name);
        setSerialNumber(a.serial_number ?? "");
        setStatus(a.status);
        setLocationId(a.location_id ? String(a.location_id) : "");
        setDepartmentId(a.department_id ? String(a.department_id) : "");
        setAssignedUserId(a.assigned_to_user_id ? String(a.assigned_to_user_id) : "");
        setPurchaseDate(toDateInputValue(a.purchase_date));
        setWarrantyEndDate(toDateInputValue(a.warranty_end_date));
        setExpiryDate(toDateInputValue(a.expiry_date));
        const pv: Record<string, string | number | boolean> = {};
        if (a.property_values && typeof a.property_values === "object") {
          Object.entries(a.property_values).forEach(([k, v]) => {
            if (v !== null && v !== undefined) pv[k] = v as string | number | boolean;
          });
        }
        setPropertyValues(pv);
        return getAssetTypeById(a.asset_type_id);
      })
      .then((at) => {
        if (at) setAssetType(at);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const setPropertyValue = (propName: string, value: string | number | boolean) => {
    setPropertyValues((prev) => ({ ...prev, [propName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;
    setError(null);
    setSaving(true);
    try {
      const pv: Record<string, unknown> = {};
      Object.entries(propertyValues).forEach(([k, v]) => {
        if (v !== "" && v !== undefined) pv[k] = v;
      });
      const body: UpdateAssetBody = {
        name: name.trim(),
        serial_number: serialNumber.trim() || null,
        status,
        location_id: locationId ? Number(locationId) : null,
        department_id: departmentId ? Number(departmentId) : null,
        assigned_to_user_id: assignedUserId ? Number(assignedUserId) : null,
        purchase_date: purchaseDate || null,
        warranty_end_date: warrantyEndDate || null,
        expiry_date: expiryDate || null,
        property_values: Object.keys(pv).length > 0 ? pv : null,
      };
      await updateAsset(asset.id, body);
      router.push(`/assets/${asset.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader breadcrumbs={[{ label: "Home", href: "/" }, { label: "Assets", href: "/assets" }, { label: "Edit" }]} />
        <div className="flex flex-1 flex-col gap-6 p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </>
    );
  }
  if (error && !asset) {
    return (
      <>
        <AppHeader breadcrumbs={[{ label: "Home", href: "/" }, { label: "Assets", href: "/assets" }]} />
        <div className="flex flex-1 flex-col gap-6 p-6">
          <p className="text-destructive">{error}</p>
          <Button asChild variant="outline">
            <Link href="/assets">Back to Assets</Link>
          </Button>
        </div>
      </>
    );
  }
  if (!asset) return null;

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Assets", href: "/assets" },
          { label: asset.name, href: `/assets/${asset.id}` },
          { label: "Edit" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="assignment">Assignment</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">Type: {asset.asset_type_name}</p>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Asset Name *</Label>
                <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-secondary border-0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-serial">Serial Number</Label>
                <Input id="edit-serial" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="bg-secondary border-0" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-secondary border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_maintenance">In Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Purchase Date</Label>
                  <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="bg-secondary border-0" />
                </div>
                <div className="space-y-2">
                  <Label>Warranty End Date</Label>
                  <Input type="date" value={warrantyEndDate} onChange={(e) => setWarrantyEndDate(e.target.value)} className="bg-secondary border-0" />
                </div>
                {assetType?.has_expiry && (
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="bg-secondary border-0" />
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="properties" className="space-y-4 mt-4">
              {assetType?.properties?.length ? (
                <div className="space-y-4">
                  {assetType.properties.map((prop) => {
                    const dataType = prop.data_type ?? "text";
                    const value = propertyValues[prop.name];
                    const options = Array.isArray(prop.config?.options) ? (prop.config.options as string[]) : [];
                    return (
                      <div key={prop.id} className="space-y-2">
                        <Label htmlFor={`edit-prop-${prop.id}`}>
                          {prop.name}
                          {prop.is_required && <span className="text-destructive"> *</span>}
                        </Label>
                        {dataType === "boolean" ? (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`edit-prop-${prop.id}`}
                              checked={value === true}
                              onCheckedChange={(checked) => setPropertyValue(prop.name, !!checked)}
                            />
                            <span className="text-sm text-muted-foreground">Yes</span>
                          </div>
                        ) : dataType === "dropdown" && options.length > 0 ? (
                          <Select
                            value={typeof value === "string" ? value : ""}
                            onValueChange={(v) => setPropertyValue(prop.name, v)}
                          >
                            <SelectTrigger id={`edit-prop-${prop.id}`} className="bg-secondary border-0">
                              <SelectValue placeholder={`Select ${prop.name}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {options.map((opt) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : dataType === "number" ? (
                          <Input
                            id={`edit-prop-${prop.id}`}
                            type="number"
                            className="bg-secondary border-0"
                            value={value !== undefined && value !== "" ? String(value) : ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              setPropertyValue(prop.name, v === "" ? "" : Number(v));
                            }}
                          />
                        ) : dataType === "date" ? (
                          <Input
                            id={`edit-prop-${prop.id}`}
                            type="date"
                            className="bg-secondary border-0"
                            value={typeof value === "string" ? value : ""}
                            onChange={(e) => setPropertyValue(prop.name, e.target.value)}
                          />
                        ) : (
                          <Input
                            id={`edit-prop-${prop.id}`}
                            className="bg-secondary border-0"
                            value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
                            onChange={(e) => setPropertyValue(prop.name, e.target.value)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No properties for this asset type.</p>
              )}
            </TabsContent>
            <TabsContent value="assignment" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger className="bg-secondary border-0">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={String(loc.id)}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger className="bg-secondary border-0">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assign to User</Label>
                <Select value={assignedUserId} onValueChange={setAssignedUserId}>
                  <SelectTrigger className="bg-secondary border-0">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.filter((u) => u.is_active).map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {[user.first_name, user.last_name].filter(Boolean).join(" ") || user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={`/assets/${asset.id}`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
