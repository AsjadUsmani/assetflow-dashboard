"use client";

import { useState, useEffect } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getAssetTypes } from "@/lib/services/asset-types";
import { getLocations } from "@/lib/services/locations";
import { getDepartments } from "@/lib/services/departments";
import { getWorkspaceUsers } from "@/lib/services/workspace-users";
import { assetStatusOptions, createAsset, type CreateAssetBody } from "@/lib/services/assets";
import type { AssetType } from "@/lib/services/asset-types";
import type { Location } from "@/lib/services/locations";
import type { Department } from "@/lib/services/departments";
import type { WorkspaceUser } from "@/lib/services/workspace-users";

export function CreateAssetDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [assetTag, setAssetTag] = useState("");
  const [cost, setCost] = useState("");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState("available");
  const [locationId, setLocationId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [assignedDate, setAssignedDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [remark, setRemark] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyEndDate, setWarrantyEndDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [propertyValues, setPropertyValues] = useState<Record<string, string | number | boolean>>({});
  const [propertyErrors, setPropertyErrors] = useState<Record<string, boolean>>({});

  const assetType = assetTypes.find((t) => String(t.id) === selectedTypeId);
  const filteredDepartments = locationId
    ? departments.filter((d) => String(d.location_id) === locationId)
    : departments;
  const assignableUsers = users.filter((u) => u.is_active || u.email_on_hold);
  const canSubmit =
    !loading &&
    Boolean(selectedTypeId) &&
    Boolean(name.trim()) &&
    Boolean(assignedUserId);

  const getPropertyDefaultValue = (prop: AssetType["properties"][number]): string | number | boolean | undefined => {
    const dataType = prop.data_type ?? "text";
    const config = (prop.config ?? {}) as Record<string, unknown>;
    const defaultFromConfig = config.defaultValue ?? config.default;

    if (dataType === "boolean") {
      if (typeof defaultFromConfig === "boolean") return defaultFromConfig;
      if (prop.is_required) return true;
      return undefined;
    }

    if (dataType === "number") {
      if (typeof defaultFromConfig === "number") return defaultFromConfig;
      if (typeof defaultFromConfig === "string" && defaultFromConfig.trim() !== "") {
        const n = Number(defaultFromConfig);
        if (!Number.isNaN(n)) return n;
      }
      return undefined;
    }

    if (dataType === "dropdown") {
      if (typeof defaultFromConfig === "string" && defaultFromConfig.trim() !== "") {
        return defaultFromConfig;
      }
      const options = Array.isArray(config.options) ? (config.options as unknown[]) : [];
      const firstOption = options.find((opt): opt is string => typeof opt === "string" && opt.trim() !== "");
      return firstOption;
    }

    if ((dataType === "date" || dataType === "text") && typeof defaultFromConfig === "string") {
      return defaultFromConfig;
    }

    return undefined;
  };

  useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([getAssetTypes(), getLocations(), getDepartments(), getWorkspaceUsers()])
        .then(([types, locs, depts, usrs]) => {
          setAssetTypes(types);
          setLocations(locs);
          setDepartments(depts);
          setUsers(usrs);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to load data");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setSelectedTypeId("");
      setName("");
      setSerialNumber("");
      setAssetTag("");
      setCost("");
      setDomain("");
      setStatus("available");
      setLocationId("");
      setDepartmentId("");
      setAssignedUserId("");
      setAssignedDate("");
      setReturnDate("");
      setRemark("");
      setPurchaseDate("");
      setWarrantyEndDate("");
      setExpiryDate("");
      setPropertyValues({});
      setPropertyErrors({});
      setError(null);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    const defaults: Record<string, string | number | boolean> = {};
    (assetType?.properties ?? []).forEach((prop) => {
      const value = getPropertyDefaultValue(prop);
      if (value !== undefined) {
        defaults[prop.name] = value;
      }
    });
    setPropertyValues(defaults);
    setPropertyErrors({});
  }, [assetType]);

  const setPropertyValue = (propName: string, value: string | number | boolean) => {
    setPropertyValues((prev) => ({ ...prev, [propName]: value }));
    if (propertyErrors[propName]) {
      setPropertyErrors((prev) => {
        const next = { ...prev };
        delete next[propName];
        return next;
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedTypeId || !name.trim() || !assignedUserId) return;

    setPropertyErrors({});
    setError(null);
    setLoading(true);
    try {
      const pv: Record<string, unknown> = {};
      Object.entries(propertyValues).forEach(([k, v]) => {
        if (v !== "" && v !== undefined) pv[k] = v;
      });
      if (serialNumber.trim()) {
        pv["Serial Number"] = serialNumber.trim();
      }
      const body: CreateAssetBody = {
        asset_type_id: Number(selectedTypeId),
        name: name.trim(),
        host_name: name.trim(),
        serial_number: serialNumber.trim() || undefined,
        asset_tag: assetTag.trim() || undefined,
        cost: cost ? parseFloat(cost) : undefined,
        domain: domain.trim() || undefined,
        status,
        location_id: locationId ? Number(locationId) : undefined,
        department_id: departmentId ? Number(departmentId) : undefined,
        assigned_to_user_id: assignedUserId ? Number(assignedUserId) : undefined,
        purchase_date: purchaseDate || undefined,
        warranty_end_date: warrantyEndDate || undefined,
        expiry_date: expiryDate || undefined,
        assigned_date: assignedDate || undefined,
        return_date: returnDate || undefined,
        remark: remark.trim() || undefined,
        property_values: Object.keys(pv).length > 0 ? pv : undefined,
      };
      await createAsset(body);
      onSuccess?.();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 size-4" />
          Add Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Asset</DialogTitle>
          <DialogDescription>
            Add a new asset to your inventory. Select an asset type and fill in the details.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="assignment">Assignment</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="assetType">Asset Type <span className="text-destructive">*</span></Label>
              <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
                <SelectTrigger className="bg-secondary border-0">
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {assetType && (
              <Alert className="bg-primary/10 border-primary/30">
                <AlertCircle className="size-4 text-primary" />
                <AlertDescription className="text-sm">
                  Behaviors:{" "}
                  {[
                    assetType.has_expiry && "expiry",
                    assetType.is_rechargeable && "rechargeable",
                    assetType.is_one_time_use && "one-time use",
                    assetType.is_movable && "movable",
                    assetType.requires_assignment && "requires assignment",
                  ].filter(Boolean).join(", ") || "none"}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Host Name <span className="text-destructive">*</span></Label>
              <Input id="name" placeholder="e.g., LAPTOP-001" className="bg-secondary border-0" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input id="serialNumber" placeholder="Serial number" className="bg-secondary border-0" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetTag">Asset Tag</Label>
              <Input id="assetTag" placeholder="Asset tag/barcode" className="bg-secondary border-0" value={assetTag} onChange={(e) => setAssetTag(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cost">Cost</Label>
                <Input id="cost" type="number" step="0.01" className="bg-secondary border-0" value={cost} onChange={(e) => setCost(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input id="domain" className="bg-secondary border-0" value={domain} onChange={(e) => setDomain(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input id="purchaseDate" type="date" className="bg-secondary border-0" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warrantyEndDate">Warranty End Date</Label>
                <Input id="warrantyEndDate" type="date" className="bg-secondary border-0" value={warrantyEndDate} onChange={(e) => setWarrantyEndDate(e.target.value)} />
              </div>
              {assetType?.has_expiry && (
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input id="expiryDate" type="date" className="bg-secondary border-0" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
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
                <Label>Assigned To <span className="text-destructive">*</span></Label>
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
                <Label htmlFor="assignedDate">Assigned Date</Label>
                <Input id="assignedDate" type="date" className="bg-secondary border-0" value={assignedDate} onChange={(e) => setAssignedDate(e.target.value)} />
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor="returnDate">Return Date</Label>
                <Input id="returnDate" type="date" className="bg-secondary border-0" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
              </div>
              <div className="space-y-2 min-w-0 sm:col-span-2">
                <Label htmlFor="remark">Remark</Label>
                <Textarea id="remark" placeholder="Additional remarks..." className="bg-secondary border-0 resize-none" value={remark} onChange={(e) => setRemark(e.target.value)} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSubmit} disabled={!canSubmit}>
            {loading ? "Creating..." : "Create Asset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
