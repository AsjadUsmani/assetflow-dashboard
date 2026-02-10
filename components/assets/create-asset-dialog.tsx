"use client";

import { useState } from "react";
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
import { assetTypes, locations, departments, users } from "@/lib/mock-data";

export function CreateAssetDialog() {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  const assetType = assetTypes.find((t) => t.id === selectedType);

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
            Add a new asset to your inventory. Select an asset type to see
            required fields.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="properties" disabled={!selectedType}>
              Properties
            </TabsTrigger>
            <TabsTrigger value="assignment" disabled={!selectedType}>
              Assignment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="assetType">
                Asset Type <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-secondary border-0">
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {assetType && (
              <Alert className="bg-primary/10 border-primary/30">
                <AlertCircle className="size-4 text-primary" />
                <AlertDescription className="text-sm">
                  This asset type has the following behaviors:{" "}
                  {[
                    assetType.hasExpiry && "tracks expiry",
                    assetType.isRechargeable && "rechargeable",
                    assetType.isOneTimeUse && "one-time use",
                    assetType.isMovable && "movable",
                    assetType.requiresAssignment && "requires assignment",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">
                Asset Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., MacBook Pro 16-inch"
                className="bg-secondary border-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                placeholder="Enter serial number"
                className="bg-secondary border-0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
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

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue="available">
                  <SelectTrigger className="bg-secondary border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_maintenance">In Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  className="bg-secondary border-0"
                />
              </div>

              {assetType?.hasExpiry && (
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">
                    Expiry Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    className="bg-secondary border-0"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="warrantyEnd">Warranty End Date</Label>
                <Input
                  id="warrantyEnd"
                  type="date"
                  className="bg-secondary border-0"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-4 mt-4">
            {assetType && assetType.properties.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Fill in the properties specific to {assetType.name} assets.
                </p>

                {assetType.properties.map((prop) => (
                  <div key={prop.id} className="space-y-2">
                    <Label htmlFor={prop.id}>
                      {prop.name}
                      {prop.required && (
                        <span className="text-destructive"> *</span>
                      )}
                    </Label>
                    {prop.type === "dropdown" && prop.options ? (
                      <Select>
                        <SelectTrigger className="bg-secondary border-0">
                          <SelectValue placeholder={`Select ${prop.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {prop.options.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : prop.type === "number" ? (
                      <Input
                        id={prop.id}
                        type="number"
                        placeholder={`Enter ${prop.name}`}
                        className="bg-secondary border-0"
                      />
                    ) : prop.type === "date" ? (
                      <Input
                        id={prop.id}
                        type="date"
                        className="bg-secondary border-0"
                      />
                    ) : (
                      <Input
                        id={prop.id}
                        placeholder={`Enter ${prop.name}`}
                        className="bg-secondary border-0"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {selectedType
                    ? "No custom properties defined for this asset type."
                    : "Select an asset type to see its properties."}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="assignment" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Assign this asset to a location, department, and optionally a
              user.
            </p>

            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-destructive">*</span>
              </Label>
              <Select>
                <SelectTrigger className="bg-secondary border-0">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">
                Department <span className="text-destructive">*</span>
              </Label>
              <Select>
                <SelectTrigger className="bg-secondary border-0">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {assetType?.requiresAssignment && (
              <div className="space-y-2">
                <Label htmlFor="assignedTo">
                  Assign To <span className="text-destructive">*</span>
                </Label>
                <Select>
                  <SelectTrigger className="bg-secondary border-0">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            Create Asset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
