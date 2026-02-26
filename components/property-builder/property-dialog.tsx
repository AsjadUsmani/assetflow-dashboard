"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProperty } from "@/lib/services/properties";

function slugCode(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export function PropertyDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [propertyType, setPropertyType] = useState("text");
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [required, setRequired] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const removeOption = (option: string) => {
    setOptions(options.filter((o) => o !== option));
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPropertyType("text");
    setOptions([]);
    setNewOption("");
    setRequired(false);
    setError(null);
    setSaving(false);
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || saving) return;

    setSaving(true);
    setError(null);
    try {
      await createProperty({
        name: trimmedName,
        code: `${slugCode(trimmedName)}_${Date.now()}`,
        description: description.trim() || undefined,
        data_type: propertyType,
        config: {
          ...(propertyType === "dropdown" ? { options } : {}),
          required,
        },
      });
      onSuccess?.();
      setOpen(false);
      resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create property");
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 size-4" />
          Add Property
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Property</DialogTitle>
          <DialogDescription>
            Define a reusable property that can be attached to asset types.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="propName">Property Name</Label>
            <Input
              id="propName"
              placeholder="e.g., Serial Number, Brand, Color"
              className="bg-secondary border-0"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="propDesc">Description</Label>
            <Input
              id="propDesc"
              placeholder="Optional description"
              className="bg-secondary border-0"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="propType">Data Type</Label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="bg-secondary border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="dropdown">Dropdown</SelectItem>
                <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
                <SelectItem value="file">File Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {propertyType === "dropdown" && (
            <div className="space-y-2">
              <Label>Dropdown Options</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add option..."
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addOption()}
                  className="bg-secondary border-0"
                />
                <Button onClick={addOption} variant="secondary">
                  <Plus className="size-4" />
                </Button>
              </div>
              {options.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {options.map((option) => (
                    <Badge
                      key={option}
                      variant="secondary"
                      className="gap-1 pr-1 bg-primary/20 text-primary"
                    >
                      {option}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-4 p-0 hover:bg-transparent"
                        onClick={() => removeOption(option)}
                      >
                        <X className="size-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {propertyType === "number" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minValue">Minimum Value</Label>
                <Input
                  id="minValue"
                  type="number"
                  placeholder="0"
                  className="bg-secondary border-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxValue">Maximum Value</Label>
                <Input
                  id="maxValue"
                  type="number"
                  placeholder="100"
                  className="bg-secondary border-0"
                />
              </div>
            </div>
          )}

          {propertyType === "text" && (
            <div className="space-y-2">
              <Label htmlFor="pattern">Validation Pattern (Regex)</Label>
              <Input
                id="pattern"
                placeholder="e.g., ^[A-Z]{2}-[0-9]{4}$"
                className="bg-secondary border-0"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Enter a regex pattern to validate input
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="defaultValue">Default Value</Label>
            <Input
              id="defaultValue"
              placeholder="Enter default value (optional)"
              className="bg-secondary border-0"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
            <div>
              <p className="font-medium text-foreground">Required Field</p>
              <p className="text-sm text-muted-foreground">
                This field must be filled when creating an asset
              </p>
            </div>
            <Switch checked={required} onCheckedChange={setRequired} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSubmit}
            disabled={saving || !name.trim()}
          >
            {saving ? "Creating..." : "Create Property"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
