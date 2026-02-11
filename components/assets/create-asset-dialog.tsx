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
import { Checkbox } from "@/components/ui/checkbox";
import { getAssetTypes } from "@/lib/services/asset-types";
import { getLocations } from "@/lib/services/locations";
import { getDepartments } from "@/lib/services/departments";
import { createAsset, type CreateAssetBody } from "@/lib/services/assets";
import type { AssetType } from "@/lib/services/asset-types";
import type { Location } from "@/lib/services/locations";
import type { Department } from "@/lib/services/departments";

export function CreateAssetDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [status, setStatus] = useState("available");
  const [locationId, setLocationId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyEndDate, setWarrantyEndDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [propertyValues, setPropertyValues] = useState<Record<string, string | number | boolean>>({});

  const assetType = assetTypes.find((t) => String(t.id) === selectedTypeId);

  useEffect(() => {
    if (open) {
      Promise.all([getAssetTypes(), getLocations(), getDepartments()]).then(
        ([types, locs, depts]) => {
          setAssetTypes(types);
          setLocations(locs);
          setDepartments(depts);
        }
      );
    } else {
      setSelectedTypeId("");
      setName("");
      setSerialNumber("");
      setStatus("available");
      setLocationId("");
      setDepartmentId("");
      setPurchaseDate("");
      setWarrantyEndDate("");
      setExpiryDate("");
      setPropertyValues({});
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    setPropertyValues({});
  }, [selectedTypeId]);

  const setPropertyValue = (propName: string, value: string | number | boolean) => {
    setPropertyValues((prev) => ({ ...prev, [propName]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedTypeId || !name.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const pv: Record<string, unknown> = {};
      Object.entries(propertyValues).forEach(([k, v]) => {
        if (v !== "" && v !== undefined) pv[k] = v;
      });
      const body: CreateAssetBody = {
        asset_type_id: Number(selectedTypeId),
        name: name.trim(),
        serial_number: serialNumber.trim() || undefined,
        status,
        location_id: locationId ? Number(locationId) : undefined,
        department_id: departmentId ? Number(departmentId) : undefined,
        purchase_date: purchaseDate || undefined,
        warranty_end_date: warrantyEndDate || undefined,
        expiry_date: expiryDate || undefined,
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="properties" disabled={!selectedTypeId}>
              Properties
            </TabsTrigger>
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
              <Label htmlFor="name">Asset Name <span className="text-destructive">*</span></Label>
              <Input id="name" placeholder="e.g., MacBook Pro 16-inch" className="bg-secondary border-0" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input id="serialNumber" placeholder="Serial number" className="bg-secondary border-0" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
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
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input id="purchaseDate" type="date" className="bg-secondary border-0" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warrantyEnd">Warranty End Date</Label>
                <Input id="warrantyEnd" type="date" className="bg-secondary border-0" value={warrantyEndDate} onChange={(e) => setWarrantyEndDate(e.target.value)} />
              </div>
              {assetType?.has_expiry && (
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input id="expiryDate" type="date" className="bg-secondary border-0" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-4 mt-4">
            {assetType?.properties?.length ? (
              <p className="text-sm text-muted-foreground">
                Fill in the properties for this {assetType.name} asset.
              </p>
            ) : null}
            {assetType?.properties?.length ? (
              <div className="space-y-4">
                {assetType.properties.map((prop) => {
                  const dataType = prop.data_type ?? "text";
                  const value = propertyValues[prop.name];
                  const options = Array.isArray(prop.config?.options) ? (prop.config.options as string[]) : [];
                  return (
                    <div key={prop.id} className="space-y-2">
                      <Label htmlFor={`prop-${prop.id}`}>
                        {prop.name}
                        {prop.is_required && <span className="text-destructive"> *</span>}
                      </Label>
                      {dataType === "boolean" ? (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`prop-${prop.id}`}
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
                          <SelectTrigger id={`prop-${prop.id}`} className="bg-secondary border-0">
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
                          id={`prop-${prop.id}`}
                          type="number"
                          className="bg-secondary border-0"
                          placeholder={prop.name}
                          value={value !== undefined && value !== "" ? String(value) : ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setPropertyValue(prop.name, v === "" ? "" : Number(v));
                          }}
                        />
                      ) : dataType === "date" ? (
                        <Input
                          id={`prop-${prop.id}`}
                          type="date"
                          className="bg-secondary border-0"
                          value={typeof value === "string" ? value : ""}
                          onChange={(e) => setPropertyValue(prop.name, e.target.value)}
                        />
                      ) : (
                        <Input
                          id={`prop-${prop.id}`}
                          className="bg-secondary border-0"
                          placeholder={prop.name}
                          value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
                          onChange={(e) => setPropertyValue(prop.name, e.target.value)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                {selectedTypeId ? "No properties defined for this asset type." : "Select an asset type first."}
              </div>
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
          </TabsContent>
        </Tabs>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSubmit} disabled={!selectedTypeId || !name.trim() || loading}>
            {loading ? "Creating..." : "Create Asset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
