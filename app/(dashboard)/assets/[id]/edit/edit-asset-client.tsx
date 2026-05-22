"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { assetStatusOptions, getAssetById, updateAsset, type Asset, type UpdateAssetBody } from "@/lib/services/assets";
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
  const requestedTab = searchParams.get("tab");
  const defaultTab = requestedTab === "assignment" ? "assignment" : "basic";
  const id = typeof params?.id === "string" ? Number(params.id) : NaN;
  const [asset, setAsset] = useState<Asset | null>(null);
  const [assetType, setAssetType] = useState<AssetType | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hostName, setHostName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [assetTag, setAssetTag] = useState("");
  const [cost, setCost] = useState("");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState("available");
  const [locationId, setLocationId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyEndDate, setWarrantyEndDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [assignedDate, setAssignedDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [remark, setRemark] = useState("");
  const [propertyValues, setPropertyValues] = useState<Record<string, string | number | boolean>>({});
  const [modelName, setModelName] = useState("");
  const [currentTab, setCurrentTab] = useState(defaultTab);

  const requiredProperties = useMemo(
    () => assetType?.properties?.filter((p) => p.is_required) ?? [],
    [assetType],
  );
  const filteredDepartments = locationId
    ? departments.filter((d) => d.location_ids.includes(Number(locationId)))
    : departments;
  const assignableUsers = users.filter((u) => u.is_active || u.email_on_hold);
  const canSave = Boolean(asset) && !saving && Boolean(assignedUserId);

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
      .then(async ([a, locs, depts, usrs]) => {
        if (!a) {
          setError("Asset not found");
          return;
        }
        const at = await getAssetTypeById(a.asset_type_id);
        setAsset(a);
        setAssetType(at);
        setLocations(locs);
        setDepartments(depts);
        setUsers(usrs);
        setHostName(a.host_name ?? a.name);
        setSerialNumber(a.serial_number ?? "");
        setAssetTag(a.asset_tag ?? "");
        setCost(a.cost != null ? String(a.cost) : "");
        setDomain(a.domain ?? "");
        setStatus(a.status);
        setLocationId(a.location_id ? String(a.location_id) : "");
        setDepartmentId(a.department_id ? String(a.department_id) : "");
        setAssignedUserId(a.assigned_to_user_id ? String(a.assigned_to_user_id) : "");
        setPurchaseDate(toDateInputValue(a.purchase_date));
        setWarrantyEndDate(toDateInputValue(a.warranty_end_date));
        setExpiryDate(toDateInputValue(a.expiry_date));
        setAssignedDate(toDateInputValue(a.assigned_date));
        setReturnDate(toDateInputValue(a.return_date));
        setRemark(a.remark ?? "");
        const pv: Record<string, string | number | boolean> = {};
        if (a.property_values && typeof a.property_values === "object") {
          Object.entries(a.property_values as Record<string, unknown>).forEach(([k, v]) => {
            if (v !== null && v !== undefined) pv[k] = v as string | number | boolean;
          });
        }

        const normalizedByName: Record<string, string | number | boolean> = {};
        if (at?.properties?.length) {
          at.properties.forEach((prop) => {
            const byName = pv[prop.name];
            const byCode = prop.code ? pv[prop.code] : undefined;
            const byId = pv[String(prop.id)];
            const resolved = byName ?? byCode ?? byId;
            if (resolved !== undefined && resolved !== null) {
              normalizedByName[prop.name] = resolved;
            }
            if (
              (prop.data_type ?? "text") === "boolean" &&
              prop.is_required &&
              normalizedByName[prop.name] === undefined
            ) {
              normalizedByName[prop.name] = true;
            }
          });
        }
        setPropertyValues(Object.keys(normalizedByName).length > 0 ? normalizedByName : pv);
        setModelName(
          String(
            normalizedByName["Model"] ??
              normalizedByName["model"] ??
              pv["Model"] ??
              pv["model"] ??
              "",
          ),
        );
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleContinueFromBasic = () => {
    if (!hostName.trim()) {
      setError("Host name is required");
      return;
    }
    setError(null);
    setCurrentTab("assignment");
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
      delete pv["model"];
      delete pv["serial_number"];
      delete pv["processor"];
      delete pv["Processor / CPU"];
      if (serialNumber.trim()) {
        pv["Serial Number"] = serialNumber.trim();
      }
      if (modelName.trim()) {
        pv["Model"] = modelName.trim();
      }
      const body: UpdateAssetBody = {
        name: hostName.trim(),
        host_name: hostName.trim(),
        serial_number: serialNumber.trim() || null,
        asset_tag: assetTag.trim() || null,
        cost: cost ? Number(cost) : null,
        domain: domain.trim() || null,
        status,
        location_id: locationId ? Number(locationId) : null,
        department_id: departmentId ? Number(departmentId) : null,
        assigned_to_user_id: assignedUserId ? Number(assignedUserId) : null,
        purchase_date: purchaseDate || null,
        warranty_end_date: warrantyEndDate || null,
        expiry_date: expiryDate || null,
        assigned_date: assignedDate || null,
        return_date: returnDate || null,
        remark: remark.trim() || null,
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
          { label: asset.host_name || asset.name, href: `/assets/${asset.id}` },
          { label: "Edit" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="assignment">Assignment</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">Type: {asset.asset_type_name}</p>
              <p className="text-sm text-muted-foreground">Created at: {toDateInputValue(asset.created_at) || "-"}</p>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Host Name *</Label>
                <Input id="edit-name" value={hostName} onChange={(e) => setHostName(e.target.value)} required className="bg-secondary border-0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-serial">Serial Number</Label>
                <Input id="edit-serial" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="bg-secondary border-0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-asset-tag">Asset Tag</Label>
                <Input
                  id="edit-asset-tag"
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  className="bg-secondary border-0"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-cost">Cost</Label>
                  <Input
                    id="edit-cost"
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="bg-secondary border-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-domain">Domain</Label>
                  <Input
                    id="edit-domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="bg-secondary border-0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-model-name">Model Name</Label>
                <Input
                  id="edit-model-name"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="bg-secondary border-0"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <TabsContent value="assignment" className="mt-6 space-y-5 pt-1">
              <div className="space-y-2">
                <Label>Status</Label>
                <SearchableSelect
                  value={status}
                  onValueChange={setStatus}
                  placeholder="Select status"
                  searchPlaceholder="Search status..."
                  options={assetStatusOptions.map((option) => ({ value: option.value, label: option.label }))}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 min-w-0">
                  <Label>Location</Label>
                  <SearchableSelect
                    value={locationId}
                    onValueChange={(v) => {
                      setLocationId(v);
                      setDepartmentId("");
                    }}
                    placeholder="Search or select location"
                    searchPlaceholder="Search locations..."
                    options={locations.map((loc) => ({ value: String(loc.id), label: loc.name }))}
                  />
                </div>
                <div className="space-y-2 min-w-0">
                  <Label>Department</Label>
                  <SearchableSelect
                    value={departmentId}
                    onValueChange={setDepartmentId}
                    placeholder="Search or select department"
                    searchPlaceholder="Search departments..."
                    options={filteredDepartments.map((d) => ({ value: String(d.id), label: d.name }))}
                  />
                </div>
                <div className="space-y-2 min-w-0 sm:col-span-2">
                  <Label>Assigned To</Label>
                  <SearchableSelect
                    value={assignedUserId}
                    onValueChange={setAssignedUserId}
                    placeholder="Search or select user"
                    searchPlaceholder="Search by username or email..."
                    options={assignableUsers.map((user) => ({
                      value: String(user.id),
                      label: `${user.username}${!user.is_active ? " (inactive)" : ""}${user.email_on_hold ? " · hold" : ""}`,
                      searchValue: `${user.username} ${user.email ?? ""}`,
                    }))}
                  />
                </div>
                <div className="space-y-2 min-w-0">
                  <Label>Assigned Date</Label>
                  <Input type="date" value={assignedDate} onChange={(e) => setAssignedDate(e.target.value)} className="bg-secondary border-0" />
                </div>
                <div className="space-y-2 min-w-0">
                  <Label>Return Date</Label>
                  <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="bg-secondary border-0" />
                </div>
                <div className="space-y-2 min-w-0 sm:col-span-2">
                  <Label>Remark</Label>
                  <Input value={remark} onChange={(e) => setRemark(e.target.value)} className="bg-secondary border-0" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex gap-2">
            {currentTab === "basic" && (
              <Button type="button" onClick={handleContinueFromBasic}>
                Continue
              </Button>
            )}
            {currentTab === "assignment" && (
              <Button type="submit" disabled={!canSave}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            )}
            <Button type="button" variant="outline" asChild>
              <Link href={`/assets/${asset.id}`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
