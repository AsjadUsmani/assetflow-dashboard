"use client";

import { useState, useEffect } from "react";
import { Plus, AlertCircle, Search } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getAssetTypes } from "@/lib/services/asset-types";
import { getLocations } from "@/lib/services/locations";
import { getDepartments } from "@/lib/services/departments";
import { getWorkspaceUsers } from "@/lib/services/workspace-users";
import { createAsset, type CreateAssetBody } from "@/lib/services/assets";
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
  const [assignmentType, setAssignmentType] = useState("");
  const [assignmentState, setAssignmentState] = useState("active");
  const [emailOnHold, setEmailOnHold] = useState(false);
  const [returnDate, setReturnDate] = useState("");
  const [remark, setRemark] = useState("");
  const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);
  const [departmentPopoverOpen, setDepartmentPopoverOpen] = useState(false);
  const [assignedUserPopoverOpen, setAssignedUserPopoverOpen] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyEndDate, setWarrantyEndDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [propertyValues, setPropertyValues] = useState<Record<string, string | number | boolean>>({});
  const [propertyErrors, setPropertyErrors] = useState<Record<string, boolean>>({});

  const assetType = assetTypes.find((t) => String(t.id) === selectedTypeId);

  const selectedLocation = locations.find((loc) => String(loc.id) === locationId);
  const selectedDepartment = departments.find((dept) => String(dept.id) === departmentId);
  const selectedAssignedUser = users.find((user) => String(user.id) === assignedUserId);
  const filteredDepartments = locationId
    ? departments.filter((d) => String(d.location_id) === locationId)
    : departments;
  const assignableUsers = users.filter((u) => u.is_active || emailOnHold);
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
      // For required boolean properties, default to true to avoid blocking form submit.
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
      setLocationPopoverOpen(false);
      setDepartmentPopoverOpen(false);
      setAssignedUserPopoverOpen(false);
      setAssignedDate("");
      setAssignmentType("");
      setAssignmentState("active");
      setEmailOnHold(false);
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

    // Temporary behavior: allow create without blocking on dynamic property requirements.
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
        assignment_type: assignmentType || undefined,
        assignment_state: assignmentState || undefined,
        email_on_hold: emailOnHold,
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Cost</Label>
                <Input id="cost" type="number" placeholder="0.00" step="0.01" className="bg-secondary border-0" value={cost} onChange={(e) => setCost(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input id="domain" placeholder="Domain" className="bg-secondary border-0" value={domain} onChange={(e) => setDomain(e.target.value)} />
              </div>
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
                      <Label htmlFor={`prop-${prop.id}`} className={propertyErrors[prop.name] ? "text-destructive" : undefined}>
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
                      {propertyErrors[prop.name] && (
                        <p className="text-xs text-destructive">This field is required</p>
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
              <Label>Status</Label>
              <SearchableSelect
                value={status}
                onValueChange={setStatus}
                placeholder="Select status"
                searchPlaceholder="Search status..."
                options={[
                  { value: "available", label: "Available" },
                  { value: "assigned", label: "Assigned" },
                  { value: "in_maintenance", label: "In Maintenance" },
                  { value: "in_stock", label: "In Stock" },
                  { value: "in_use", label: "In Use" },
                  { value: "retired", label: "Retired" },
                  { value: "lost", label: "Lost" },
                  { value: "pending_disposal", label: "Pending for Disposal" },
                  { value: "disposed", label: "Disposed" },
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label>Location/Office</Label>
              <Popover open={locationPopoverOpen} onOpenChange={setLocationPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2 font-normal">
                    <Search className="size-4" />
                    {selectedLocation ? selectedLocation.name : "Search or select location"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 max-w-[calc(100vw-2rem)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search locations..." />
                    <CommandList>
                      <CommandEmpty>No locations found.</CommandEmpty>
                      <CommandGroup>
                        {locations.map((loc) => (
                          <CommandItem
                            key={loc.id}
                            value={loc.name}
                            onSelect={() => {
                              setLocationId(String(loc.id));
                              setDepartmentId("");
                              setLocationPopoverOpen(false);
                            }}
                          >
                            {loc.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Popover open={departmentPopoverOpen} onOpenChange={setDepartmentPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2 font-normal">
                    <Search className="size-4" />
                    {selectedDepartment ? selectedDepartment.name : "Search or select department"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 max-w-[calc(100vw-2rem)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search departments..." />
                    <CommandList>
                      <CommandEmpty>No departments found.</CommandEmpty>
                      <CommandGroup>
                        {filteredDepartments.map((dept) => (
                          <CommandItem
                            key={dept.id}
                            value={dept.name}
                            onSelect={() => {
                              setDepartmentId(String(dept.id));
                              setDepartmentPopoverOpen(false);
                            }}
                          >
                            {dept.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Assigned To <span className="text-destructive">*</span></Label>
              <Popover open={assignedUserPopoverOpen} onOpenChange={setAssignedUserPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2 font-normal">
                    <Search className="size-4" />
                    {selectedAssignedUser ? selectedAssignedUser.username : "Search or select user"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 max-w-[calc(100vw-2rem)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search users..." />
                    <CommandList>
                      <CommandEmpty>No users found.</CommandEmpty>
                      <CommandGroup>
                        {assignableUsers.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={`${user.username} ${user.email ?? ""}`.trim()}
                              onSelect={() => {
                                setAssignedUserId(String(user.id));
                                setAssignedUserPopoverOpen(false);
                              }}
                            >
                              {user.username}
                              {!user.is_active ? " (inactive)" : ""}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedDate">Assigned Date</Label>
              <Input id="assignedDate" type="date" className="bg-secondary border-0" value={assignedDate} onChange={(e) => setAssignedDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assignment Type</Label>
                <SearchableSelect
                  value={assignmentType}
                  onValueChange={setAssignmentType}
                  placeholder="Permanent or Loaner"
                  searchPlaceholder="Search..."
                  options={[
                    { value: "Permanent", label: "Permanent" },
                    { value: "Loaner", label: "Loaner" },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label>Assignment State</Label>
                <SearchableSelect
                  value={assignmentState}
                  onValueChange={setAssignmentState}
                  placeholder="Active or Inactive"
                  searchPlaceholder="Search..."
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive (Terminate)" },
                  ]}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="email-on-hold"
                checked={emailOnHold}
                onCheckedChange={(checked) => setEmailOnHold(!!checked)}
              />
              <Label htmlFor="email-on-hold" className="font-normal cursor-pointer">
                Hold — keep assignee email usable after the user has left
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="returnDate">Return Date</Label>
              <Input id="returnDate" type="date" className="bg-secondary border-0" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remark">Remark</Label>
              <Textarea id="remark" placeholder="Additional remarks..." className="bg-secondary border-0 resize-none" value={remark} onChange={(e) => setRemark(e.target.value)} />
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
