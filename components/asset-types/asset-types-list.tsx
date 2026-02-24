"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  Zap,
  Package,
  ArrowLeftRight,
  UserCheck,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Eye,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getAssetTypes,
  getAssetTypeById,
  updateAssetType,
  duplicateAssetType,
  deleteAssetType,
  type AssetType,
  type UpdateAssetTypeBody,
} from "@/lib/services/asset-types";
import { getProperties, createProperty, type Property } from "@/lib/services/properties";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Loader2, GripVertical } from "lucide-react";

function slugCode(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

type SelectedProp = { id: number; name: string; data_type: string; required: boolean };

function EditAssetTypeDialog({
  assetTypeId,
  onClose,
  onSaved,
}: {
  assetTypeId: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [assetType, setAssetType] = React.useState<AssetType | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [hasExpiry, setHasExpiry] = React.useState(false);
  const [isRechargeable, setIsRechargeable] = React.useState(false);
  const [isOneTimeUse, setIsOneTimeUse] = React.useState(false);
  const [isMovable, setIsMovable] = React.useState(true);
  const [requiresAssignment, setRequiresAssignment] = React.useState(true);
  const [selected, setSelected] = React.useState<SelectedProp[]>([]);
  const [existingProperties, setExistingProperties] = React.useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = React.useState(false);
  const [propertyPopoverOpen, setPropertyPopoverOpen] = React.useState(false);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newCode, setNewCode] = React.useState("");
  const [newDataType, setNewDataType] = React.useState("text");
  const [creating, setCreating] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);

  React.useEffect(() => {
    Promise.all([getAssetTypeById(assetTypeId), getProperties()])
      .then(([at, props]) => {
        setAssetType(at ?? null);
        setExistingProperties(props);
        if (at) {
          setName(at.name);
          setCode(at.code);
          setDescription(at.description ?? "");
          setHasExpiry(at.has_expiry ?? false);
          setIsRechargeable(at.is_rechargeable ?? false);
          setIsOneTimeUse(at.is_one_time_use ?? false);
          setIsMovable(at.is_movable ?? true);
          setRequiresAssignment(at.requires_assignment ?? true);
          const propMap = new Map(props.map((p) => [p.id, p]));
          setSelected(
            at.properties.map((p) => ({
              id: p.id,
              name: p.name,
              data_type: propMap.get(p.id)?.data_type ?? "text",
              required: p.is_required ?? false,
            }))
          );
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [assetTypeId]);

  const addExisting = (p: Property) => {
    if (selected.some((s) => s.id === p.id)) return;
    setSelected((prev) => [...prev, { id: p.id, name: p.name, data_type: p.data_type, required: false }]);
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
    const nameTrim = newName.trim();
    const codeTrim = newCode.trim() || slugCode(nameTrim);
    if (!nameTrim) return;
    setCreateError(null);
    setCreating(true);
    try {
      const created = await createProperty({
        name: nameTrim,
        code: codeTrim || slugCode(nameTrim),
        data_type: newDataType,
      });
      addNewlyCreated(created);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to create property");
    } finally {
      setCreating(false);
    }
  };
  const removeProperty = (id: number) => setSelected((prev) => prev.filter((p) => p.id !== id));
  const toggleRequired = (id: number) =>
    setSelected((prev) => prev.map((p) => (p.id === id ? { ...p, required: !p.required } : p)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetType) return;
    setError(null);
    setSaving(true);
    try {
      const body: UpdateAssetTypeBody = {
        name: name.trim() || assetType.name,
        code: code.trim() || assetType.code,
        description: description.trim() || null,
        has_expiry: hasExpiry,
        is_rechargeable: isRechargeable,
        is_one_time_use: isOneTimeUse,
        is_movable: isMovable,
        requires_assignment: requiresAssignment,
        properties: selected.map((p, i) => ({ property_id: p.id, is_required: p.required, sort_order: i })),
      };
      await updateAssetType(assetType.id, body);
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const alreadySelectedIds = new Set(selected.map((s) => s.id));
  const availableToAdd = existingProperties.filter((p) => !alreadySelectedIds.has(p.id));

  if (loading) {
    return (
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-lg">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </DialogContent>
      </Dialog>
    );
  }
  if (!assetType) {
    return (
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-lg">
          <p className="text-sm text-destructive">Asset type not found.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Asset Type</DialogTitle>
          <DialogDescription>Update name, code, description, and properties.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Tabs defaultValue="general" className="mt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="behavior">Behavior</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code">Code</Label>
                <Input id="edit-code" value={code} onChange={(e) => setCode(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Description</Label>
                <Textarea id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
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
                    <p className="text-sm text-muted-foreground">Track expiration dates for licenses, warranties, etc.</p>
                  </div>
                  <Switch checked={hasExpiry} onCheckedChange={setHasExpiry} />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                  <div>
                    <p className="font-medium text-foreground">Is Rechargeable</p>
                    <p className="text-sm text-muted-foreground">Assets that need periodic recharging or refilling</p>
                  </div>
                  <Switch checked={isRechargeable} onCheckedChange={setIsRechargeable} />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                  <div>
                    <p className="font-medium text-foreground">Is One-Time Use</p>
                    <p className="text-sm text-muted-foreground">Consumable items that are used once and discarded</p>
                  </div>
                  <Switch checked={isOneTimeUse} onCheckedChange={setIsOneTimeUse} />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                  <div>
                    <p className="font-medium text-foreground">Is Movable</p>
                    <p className="text-sm text-muted-foreground">Can be transferred between locations/departments</p>
                  </div>
                  <Switch checked={isMovable} onCheckedChange={setIsMovable} />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                  <div>
                    <p className="font-medium text-foreground">Requires Assignment</p>
                    <p className="text-sm text-muted-foreground">Must be assigned to a user for accountability</p>
                  </div>
                  <Switch checked={requiresAssignment} onCheckedChange={setRequiresAssignment} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="properties" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Search or add existing properties, or create new ones.
              </p>
              <Popover open={propertyPopoverOpen} onOpenChange={setPropertyPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="gap-2">
                    <Search className="size-4" />
                    Search or add property
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search properties..." />
                    <CommandList>
                      <CommandEmpty>
                        {propertiesLoading ? "Loading..." : showCreateForm ? null : "No properties found."}
                      </CommandEmpty>
                      {!showCreateForm && (
                        <CommandGroup heading="Existing">
                          {availableToAdd.map((p) => (
                            <CommandItem key={p.id} value={`${p.name} ${p.code}`} onSelect={() => addExisting(p)}>
                              <span className="font-medium">{p.name}</span>
                              <Badge variant="secondary" className="ml-2 text-xs">{p.data_type}</Badge>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                      <CommandGroup heading="New">
                        <CommandItem onSelect={() => setShowCreateForm(true)} className="text-primary">
                          <Plus className="mr-2 size-4" />
                          Create new property...
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                  {showCreateForm && (
                    <div className="border-t border-border p-3 space-y-3 bg-muted/30">
                      <Input
                        placeholder="Property name"
                        value={newName}
                        onChange={(e) => {
                          setNewName(e.target.value);
                          if (!newCode || newCode === slugCode(newName)) setNewCode(slugCode(e.target.value));
                        }}
                        className="bg-background"
                      />
                      <Input
                        placeholder="Code (optional)"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        className="bg-background font-mono text-sm"
                      />
                      <Select value={newDataType} onValueChange={setNewDataType}>
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
                      {createError && <p className="text-xs text-destructive">{createError}</p>}
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="secondary" onClick={() => setShowCreateForm(false)}>
                          Cancel
                        </Button>
                        <Button type="button" size="sm" disabled={!newName.trim() || creating} onClick={handleCreateProperty}>
                          {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                          <span className="ml-1">Create & add</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              {selected.length > 0 && (
                <div className="space-y-2">
                  {selected.map((prop) => (
                    <div key={prop.id} className="flex items-center gap-2 rounded-lg bg-secondary p-3">
                      <GripVertical className="size-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-foreground">{prop.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">{prop.data_type}</Badge>
                      </div>
                      <Label htmlFor={`req-${prop.id}`} className="text-xs text-muted-foreground whitespace-nowrap">Required</Label>
                      <Switch
                        id={`req-${prop.id}`}
                        checked={prop.required}
                        onCheckedChange={() => toggleRequired(prop.id)}
                      />
                      <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => removeProperty(prop.id)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const behaviorFlags = [
  { key: "hasExpiry", label: "Has Expiry", icon: Calendar },
  { key: "isRechargeable", label: "Rechargeable", icon: Zap },
  { key: "isOneTimeUse", label: "One-Time Use", icon: Package },
  { key: "isMovable", label: "Movable", icon: ArrowLeftRight },
  { key: "requiresAssignment", label: "Requires Assignment", icon: UserCheck },
] as const;

function ViewDetailsDialog({
  assetType,
  onClose,
}: {
  assetType: AssetType
  onClose: () => void
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{assetType.name}</DialogTitle>
          <DialogDescription>
            Asset type details
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Code</p>
            <p className="text-sm text-foreground mt-0.5">{assetType.code}</p>
          </div>
          {assetType.description && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</p>
              <p className="text-sm text-foreground mt-0.5">{assetType.description}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Properties</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {assetType.properties.length === 0 ? (
                <span className="text-sm text-muted-foreground">None</span>
              ) : (
                assetType.properties.map((prop) => (
                  <Badge key={prop.id} variant="secondary" className="text-xs">
                    {prop.name}
                  </Badge>
                ))
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created</p>
            <p className="text-sm text-foreground mt-0.5">
              {new Date(assetType.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AssetTypesList() {
  const [items, setItems] = React.useState<AssetType[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [viewing, setViewing] = React.useState<AssetType | null>(null);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [actionId, setActionId] = React.useState<number | null>(null);

  const loadList = React.useCallback(() => {
    getAssetTypes()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load asset types"));
  }, []);

  React.useEffect(() => {
    loadList();
  }, [loadList]);

  const handleDuplicate = async (id: number) => {
    try {
      setError(null);
      setActionId(id);
      await duplicateAssetType(id);
      loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to duplicate asset type");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      setActionId(id);
      await deleteAssetType(id);
      if (viewing?.id === id) setViewing(null);
      if (editingId === id) setEditingId(null);
      loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete asset type");
    } finally {
      setActionId(null);
    }
  };

  if (error) {
    return <div className="text-sm text-destructive">{error}</div>;
  }

  if (!items.length) {
    return (
      <div className="text-sm text-muted-foreground">No asset types found.</div>
    );
  }

  return (
    <>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((assetType) => (
        <Card key={assetType.id} className="bg-card border-border group">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="flex-1">
              <CardTitle className="text-base font-medium text-foreground">
                {assetType.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {assetType.description}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewing(assetType)}>
                  <Eye className="mr-2 size-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditingId(assetType.id)}>
                  <Pencil className="mr-2 size-4" />
                  Edit Type
                </DropdownMenuItem>
                <DropdownMenuItem disabled={actionId === assetType.id} onClick={() => handleDuplicate(assetType.id)}>
                  <Copy className="mr-2 size-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={actionId === assetType.id} className="text-destructive" onClick={() => handleDelete(assetType.id)}>
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {behaviorFlags.map((flag) => {
                const isEnabled = false; // behavior flags not yet stored in backend
                const Icon = flag.icon;

                return (
                  <Badge
                    key={flag.key}
                    variant={isEnabled ? "default" : "outline"}
                    className={
                      isEnabled
                        ? "bg-primary/20 text-primary border-primary/30"
                        : "bg-secondary text-muted-foreground border-border"
                    }
                  >
                    <Icon className="mr-1 size-3" />
                    {flag.label}
                  </Badge>
                );
              })}
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Properties</span>
                <span className="font-medium text-foreground">
                  {assetType.properties.length}
                </span>
              </div>
              {assetType.properties.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {assetType.properties.slice(0, 4).map((prop) => (
                    <Badge
                      key={prop.id}
                      variant="secondary"
                      className="text-xs bg-secondary text-muted-foreground"
                    >
                      {prop.name}
                    </Badge>
                  ))}
                  {assetType.properties.length > 4 && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-secondary text-muted-foreground"
                    >
                      +{assetType.properties.length - 4} more
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
              <span>
                Created{" "}
                {new Date(assetType.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <Button variant="ghost" size="sm" className="h-auto py-1 text-primary" asChild>
                <Link href={`/assets?assetType=${assetType.id}`}>
                  View assets
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    {viewing && (
      <ViewDetailsDialog assetType={viewing} onClose={() => setViewing(null)} />
    )}
    {editingId !== null && (
      <EditAssetTypeDialog
        assetTypeId={editingId}
        onClose={() => setEditingId(null)}
        onSaved={loadList}
      />
    )}
    </>
  );
}
