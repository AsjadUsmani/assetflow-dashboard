"use client";

import React from "react";
import {
  Type,
  Hash,
  Calendar,
  ChevronDown,
  ToggleLeft,
  FileUp,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  type Property,
} from "@/lib/services/properties";

function slugCode(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  text: Type,
  number: Hash,
  date: Calendar,
  dropdown: ChevronDown,
  boolean: ToggleLeft,
  file: FileUp,
};

function PropertyEditDialog({
  propertyId,
  onClose,
  onSaved,
}: {
  propertyId: number
  onClose: () => void
  onSaved: () => void
}) {
  const [property, setProperty] = React.useState<Property | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [dataType, setDataType] = React.useState("text");

  React.useEffect(() => {
    getPropertyById(propertyId)
      .then((p) => {
        setProperty(p ?? null);
        if (p) {
          setName(p.name);
          setDescription(p.description ?? "");
          setDataType(p.data_type ?? "text");
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setError(null);
    setSaving(true);
    try {
      await updateProperty(property.id, {
        name: name.trim() || property.name,
        description: description.trim() || undefined,
        data_type: dataType,
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>
            Update property name, description, and data type.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : !property ? (
          <p className="text-sm text-destructive">Property not found.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Property Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Data Type</Label>
              <Select value={dataType} onValueChange={setDataType}>
                <SelectTrigger id="edit-type">
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function PropertyBuilderList() {
  const [items, setItems] = React.useState<Property[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [editId, setEditId] = React.useState<number | null>(null);
  const [actionId, setActionId] = React.useState<number | null>(null);

  const loadList = React.useCallback(() => {
    getProperties()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load properties"));
  }, []);

  React.useEffect(() => {
    loadList();
  }, [loadList]);

  const handleDuplicate = async (property: Property) => {
    try {
      setError(null);
      setActionId(property.id);
      const detail = await getPropertyById(property.id);
      if (!detail) throw new Error("Property not found");
      const duplicateName = `${detail.name} Copy`;
      await createProperty({
        name: duplicateName,
        code: `${slugCode(duplicateName)}_${Date.now()}`,
        description: detail.description ?? undefined,
        data_type: detail.data_type,
        config: detail.config ?? undefined,
      });
      loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to duplicate property");
    } finally {
      setActionId(null);
    }
  };

  if (error) {
    return <div className="text-sm text-destructive">{error}</div>;
  }

  if (!items.length) {
    return (
      <div className="text-sm text-muted-foreground">No properties found.</div>
    );
  }

  return (
    <>
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Property Name</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Required</TableHead>
              <TableHead className="text-muted-foreground">Used In</TableHead>
              <TableHead className="text-muted-foreground">Created</TableHead>
              <TableHead className="text-muted-foreground w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((property) => {
              const TypeIcon = typeIcons[property.data_type] ?? Type;

              return (
                <TableRow key={property.id} className="border-border">
                  <TableCell className="font-medium text-foreground">
                    {property.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1.5 bg-secondary border-border">
                      <TypeIcon className="size-3" />
                      <span className="capitalize">{property.data_type}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={property.required ? "default" : "secondary"}
                      className={
                        property.required
                          ? "bg-primary/20 text-primary border-primary/30"
                          : "bg-secondary text-muted-foreground"
                      }
                    >
                      {property.required ? "Required" : "Optional"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {property.usedIn.slice(0, 2).map((type) => (
                        <Badge
                          key={type}
                          variant="secondary"
                          className="text-xs bg-secondary text-muted-foreground"
                        >
                          {type}
                        </Badge>
                      ))}
                      {property.usedIn.length > 2 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-secondary text-muted-foreground"
                        >
                          +{property.usedIn.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(property.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditId(property.id)}>
                          <Pencil className="mr-2 size-4" />
                          Edit Property
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={actionId === property.id} onClick={() => handleDuplicate(property)}>
                          <Copy className="mr-2 size-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={async () => {
                            if (!confirm("Delete this property?")) return;
                            try {
                              await deleteProperty(property.id);
                              loadList();
                            } catch {
                              // ignore
                            }
                          }}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    {editId !== null && (
      <PropertyEditDialog
        propertyId={editId}
        onClose={() => setEditId(null)}
        onSaved={loadList}
      />
    )}
    </>
  );
}
