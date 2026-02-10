"use client";

import { useState } from "react";
import { Plus, X, GripVertical } from "lucide-react";
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

interface PropertyField {
  id: string;
  name: string;
  type: string;
  required: boolean;
}

export function AssetTypeDialog() {
  const [open, setOpen] = useState(false);
  const [properties, setProperties] = useState<PropertyField[]>([]);
  const [newPropName, setNewPropName] = useState("");
  const [newPropType, setNewPropType] = useState("text");

  const addProperty = () => {
    if (newPropName.trim()) {
      setProperties([
        ...properties,
        {
          id: `prop-${Date.now()}`,
          name: newPropName.trim(),
          type: newPropType,
          required: false,
        },
      ]);
      setNewPropName("");
      setNewPropType("text");
    }
  };

  const removeProperty = (id: string) => {
    setProperties(properties.filter((p) => p.id !== id));
  };

  const toggleRequired = (id: string) => {
    setProperties(
      properties.map((p) =>
        p.id === id ? { ...p, required: !p.required } : p
      )
    );
  };

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
            Define a new asset type with behavior flags and custom properties.
          </DialogDescription>
        </DialogHeader>

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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this asset type is used for..."
                className="bg-secondary border-0 min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Default Category</Label>
              <Select>
                <SelectTrigger className="bg-secondary border-0">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Physical</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="consumable">Consumable</SelectItem>
                  <SelectItem value="rechargeable">Rechargeable</SelectItem>
                </SelectContent>
              </Select>
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
                <Switch />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                <div>
                  <p className="font-medium text-foreground">Is Rechargeable</p>
                  <p className="text-sm text-muted-foreground">
                    Assets that need periodic recharging or refilling
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                <div>
                  <p className="font-medium text-foreground">Is One-Time Use</p>
                  <p className="text-sm text-muted-foreground">
                    Consumable items that are used once and discarded
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                <div>
                  <p className="font-medium text-foreground">Is Movable</p>
                  <p className="text-sm text-muted-foreground">
                    Can be transferred between locations/departments
                  </p>
                </div>
                <Switch defaultChecked />
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
                <Switch defaultChecked />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Add custom properties to collect specific information for this
              asset type.
            </p>

            <div className="flex gap-2">
              <Input
                placeholder="Property name"
                value={newPropName}
                onChange={(e) => setNewPropName(e.target.value)}
                className="bg-secondary border-0"
              />
              <Select value={newPropType} onValueChange={setNewPropType}>
                <SelectTrigger className="w-32 bg-secondary border-0">
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
              <Button onClick={addProperty} variant="secondary">
                <Plus className="size-4" />
              </Button>
            </div>

            {properties.length > 0 ? (
              <div className="space-y-2">
                {properties.map((prop) => (
                  <div
                    key={prop.id}
                    className="flex items-center gap-2 rounded-lg bg-secondary p-3"
                  >
                    <GripVertical className="size-4 text-muted-foreground cursor-grab" />
                    <div className="flex-1">
                      <span className="font-medium text-foreground">{prop.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {prop.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`required-${prop.id}`}
                        className="text-xs text-muted-foreground"
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
                      className="size-8 text-muted-foreground hover:text-destructive"
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
                  No properties added yet. Add properties to collect specific
                  information for this asset type.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setOpen(false)}
          >
            Create Asset Type
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
