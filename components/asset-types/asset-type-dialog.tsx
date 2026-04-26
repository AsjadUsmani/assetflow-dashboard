"use client";

import { useState, useEffect } from "react";
import { Plus, X, GripVertical, Search, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  getProperties,
  createProperty,
  type Property,
  type CreatePropertyBody,
} from "@/lib/services/properties";
import {
  createAssetType,
  type CreateAssetTypeBody,
} from "@/lib/services/asset-types";

interface SelectedProperty {
  id: number;
  name: string;
  data_type: string;
  required: boolean;
}

function slugCode(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

interface AssetTypeFormData {
  name: string;
  description: string;
  hasExpiry: boolean;
  isRechargeable: boolean;
  isOneTimeUse: boolean;
  isMovable: boolean;
  requiresAssignment: boolean;
}

export function AssetTypeDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingProperties, setExistingProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [selected, setSelected] = useState<SelectedProperty[]>([]);
  const [propertyPopoverOpen, setPropertyPopoverOpen] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newDataType, setNewDataType] = useState("text");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AssetTypeFormData>({
    name: "",
    description: "",
    hasExpiry: false,
    isRechargeable: false,
    isOneTimeUse: false,
    isMovable: true,
    requiresAssignment: true,
  });

  useEffect(() => {
    if (open) {
      setPropertiesLoading(true);
      getProperties()
        .then(setExistingProperties)
        .catch(() => setExistingProperties([]))
        .finally(() => setPropertiesLoading(false));
    } else {
      setFormData({
        name: "",
        description: "",
        hasExpiry: false,
        isRechargeable: false,
        isOneTimeUse: false,
        isMovable: true,
        requiresAssignment: true,
      });
      setSelected([]);
      setShowCreateForm(false);
      setPropertyPopoverOpen(false);
      setError(null);
    }
  }, [open]);

  const addExisting = (p: Property) => {
    if (selected.some((s) => s.id === p.id)) return;
    setSelected((prev) => [
      ...prev,
      { id: p.id, name: p.name, data_type: p.data_type, required: false },
    ]);
    setPropertyPopoverOpen(false);
  };

  const addNewlyCreated = (p: Property) => {
    setExistingProperties((prev) => [...prev, p]);
    addExisting(p);
    setShowCreateForm(false);
    setNewName("");
    setNewCode("");
    setNewDataType("text");
    setCreateError(null);
  };

  const handleCreateProperty = async () => {
    const name = newName.trim();
    const code = newCode.trim() || slugCode(name);
    if (!name) return;
    setCreateError(null);
    setCreating(true);
    try {
      const body: CreatePropertyBody = {
        name,
        code: code || slugCode(name),
        data_type: newDataType,
      };
      const created = await createProperty(body);
      addNewlyCreated(created);
    } catch (e) {
      setCreateError(
        e instanceof Error ? e.message : "Failed to create property",
      );
    } finally {
      setCreating(false);
    }
  };

  const removeProperty = (id: number) => {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleRequired = (id: number) => {
    setSelected((prev) =>
      prev.map((p) => (p.id === id ? { ...p, required: !p.required } : p)),
    );
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || saving) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const body: CreateAssetTypeBody = {
        name: formData.name,
        description: formData.description || null,
        has_expiry: formData.hasExpiry,
        is_rechargeable: formData.isRechargeable,
        is_one_time_use: formData.isOneTimeUse,
        is_movable: formData.isMovable,
        requires_assignment: formData.requiresAssignment,
        properties: selected.map((p, i) => ({
          property_id: p.id,
          is_required: p.required,
          sort_order: i,
        })),
      };

      await createAssetType(body);

      // Close dialog and trigger refresh
      onSuccess?.();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create asset type");
    } finally {
      setSaving(false);
    }
  };

  const alreadySelectedIds = new Set(selected.map((s) => s.id));
  const availableToAdd = existingProperties.filter(
    (p) => !alreadySelectedIds.has(p.id),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 size-4" />
          Add Asset Type
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Asset Type</DialogTitle>
          <DialogDescription>
            Define a new asset type.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Type Name</Label>
              <Input
                id="name"
                placeholder="e.g., Laptop, Software License, Office Furniture"
                className="bg-secondary border-0"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this asset type is used for..."
                className="bg-secondary border-0 min-h-[100px]"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Configure how assets of this type behave in the system.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                <div>
                  <p className="font-medium text-foreground">Has Expiry Date</p>
                  <p className="text-sm text-muted-foreground">
                    Track expiration dates for licenses, warranties, etc.
                  </p>
                </div>
                <Switch
                  checked={formData.hasExpiry}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, hasExpiry: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                <div>
                  <p className="font-medium text-foreground">Is Rechargeable</p>
                  <p className="text-sm text-muted-foreground">
                    Assets that need periodic recharging or refilling
                  </p>
                </div>
                <Switch
                  checked={formData.isRechargeable}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isRechargeable: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                <div>
                  <p className="font-medium text-foreground">Is One-Time Use</p>
                  <p className="text-sm text-muted-foreground">
                    Consumable items that are used once and discarded
                  </p>
                </div>
                <Switch
                  checked={formData.isOneTimeUse}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isOneTimeUse: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                <div>
                  <p className="font-medium text-foreground">Is Movable</p>
                  <p className="text-sm text-muted-foreground">
                    Can be transferred between locations/departments
                  </p>
                </div>
                <Switch
                  checked={formData.isMovable}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isMovable: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                <div>
                  <p className="font-medium text-foreground">
                    Requires Assignment
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Must be assigned to a user for accountability
                  </p>
                </div>
                <Switch
                  checked={formData.requiresAssignment}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      requiresAssignment: checked,
                    }))
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Search and add existing properties, or create new ones. You can
              add multiple properties to this asset type.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Popover
                open={propertyPopoverOpen}
                onOpenChange={setPropertyPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Search className="size-4" />
                    Search or add property
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search properties by name or code..." />
                    <CommandList>
                      <CommandEmpty>
                        {propertiesLoading ? (
                          <span className="flex items-center gap-2 justify-center py-4 text-muted-foreground">
                            <Loader2 className="size-4 animate-spin" />
                            Loading...
                          </span>
                        ) : showCreateForm ? null : (
                          "No properties found. Create one below."
                        )}
                      </CommandEmpty>
                      {!showCreateForm && (
                        <CommandGroup heading="Existing properties">
                          {availableToAdd.map((p) => (
                            <CommandItem
                              key={p.id}
                              value={`${p.name} ${p.code}`}
                              onSelect={() => addExisting(p)}
                            >
                              <span className="font-medium">{p.name}</span>
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                {p.data_type}
                              </Badge>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                      <CommandGroup heading="New property">
                        <CommandItem
                          onSelect={() => setShowCreateForm(true)}
                          className="text-primary"
                        >
                          <Plus className="mr-2 size-4" />
                          Create new property...
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                  {showCreateForm && (
                    <div className="border-t border-border p-3 space-y-3 bg-muted/30">
                      <p className="text-xs font-medium text-muted-foreground">
                        New property
                      </p>
                      <Input
                        placeholder="Property name"
                        value={newName}
                        onChange={(e) => {
                          setNewName(e.target.value);
                          if (!newCode || newCode === slugCode(newName))
                            setNewCode(slugCode(e.target.value));
                        }}
                        className="bg-background"
                      />
                      <Input
                        placeholder="Code (optional, auto from name)"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        className="bg-background font-mono text-sm"
                      />
                      <Select
                        value={newDataType}
                        onValueChange={setNewDataType}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="dropdown">Dropdown</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="file">File</SelectItem>
                        </SelectContent>
                      </Select>
                      {createError && (
                        <p className="text-xs text-destructive">
                          {createError}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setShowCreateForm(false);
                            setCreateError(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={!newName.trim() || creating}
                          onClick={handleCreateProperty}
                        >
                          {creating ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Plus className="size-4" />
                          )}
                          <span className="ml-1">Create & add</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            {selected.length > 0 ? (
              <div className="space-y-2">
                {selected.map((prop) => (
                  <div
                    key={prop.id}
                    className="flex items-center gap-2 rounded-lg bg-secondary p-3"
                  >
                    <GripVertical className="size-4 text-muted-foreground cursor-grab shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-foreground">
                        {prop.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="ml-2 text-xs shrink-0"
                      >
                        {prop.data_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Label
                        htmlFor={`required-${prop.id}`}
                        className="text-xs text-muted-foreground whitespace-nowrap"
                      >
                        Required
                      </Label>
                      <Switch
                        id={`required-${prop.id}`}
                        checked={prop.required}
                        onCheckedChange={() => toggleRequired(prop.id)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeProperty(prop.id)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No properties added yet. Use &quot;Search or add
                  property&quot; to add existing ones or create new.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSubmit}
            disabled={saving || !formData.name.trim()}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Asset Type"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
