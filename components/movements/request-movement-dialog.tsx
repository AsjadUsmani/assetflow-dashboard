"use client";

import React from "react";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAssets } from "@/lib/services/assets";
import { createRequest } from "@/lib/services/requests";
import { getLocations, type Location } from "@/lib/services/locations";
import { getDepartments, type Department } from "@/lib/services/departments";

export function RequestMovementDialog() {
  const [open, setOpen] = useState(false);
  const [movementType, setMovementType] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [assets, setAssets] = useState<
    { id: number; name: string; serial_number: string | null }[]
  >([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [fromLocationId, setFromLocationId] = useState<string>("");
  const [toLocationId, setToLocationId] = useState<string>("");
  const [fromDepartmentId, setFromDepartmentId] = useState<string>("");
  const [toDepartmentId, setToDepartmentId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    Boolean(movementType) &&
    Boolean(selectedAsset) &&
    Boolean(fromLocationId) &&
    Boolean(toLocationId) &&
    Boolean(fromDepartmentId) &&
    Boolean(toDepartmentId) &&
    !submitting;

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [assetsData, locationsData, departmentsData] = await Promise.all([
          getAssets(),
          getLocations(),
          getDepartments(),
        ]);
        if (!isMounted) return;
        setAssets(
          assetsData.map((a) => ({
            id: a.id,
            name: a.name,
            serial_number: a.serial_number,
          })),
        );
        setLocations(locationsData);
        setDepartments(departmentsData);
      } catch {
        // ignore, global error handler will display if needed
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setMovementType("");
      setSelectedAsset("");
      setFromLocationId("");
      setToLocationId("");
      setFromDepartmentId("");
      setToDepartmentId("");
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await createRequest({
        type: movementType,
        asset_id: selectedAsset ? Number(selectedAsset) : undefined,
        from_location_id: fromLocationId ? Number(fromLocationId) : undefined,
        to_location_id: toLocationId ? Number(toLocationId) : undefined,
        from_department_id: fromDepartmentId ? Number(fromDepartmentId) : undefined,
        to_department_id: toDepartmentId ? Number(toDepartmentId) : undefined,
        reason: "Movement request from Movements screen",
      });

      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          Request Movement
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Request Asset Movement</DialogTitle>
            <DialogDescription>
              Submit a request to transfer, checkout, or return an asset
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="movement-type">Movement Type *</Label>
              <Select value={movementType} onValueChange={setMovementType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select movement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="checkout">Checkout</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                  <SelectItem value="maintenance">Send to Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset">Asset *</Label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={String(asset.id)}>
                      {asset.name}
                      {asset.serial_number ? ` (${asset.serial_number})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from-location">From Location *</Label>
                <Select value={fromLocationId} onValueChange={setFromLocationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Current location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={String(location.id)}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="to-location">To Location *</Label>
                <Select value={toLocationId} onValueChange={setToLocationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={String(location.id)}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from-department">From Department *</Label>
                <Select
                  value={fromDepartmentId}
                  onValueChange={setFromDepartmentId}
                  disabled={!fromLocationId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Current dept" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments
                      .filter(
                        (d) =>
                          !fromLocationId || d.location_ids.includes(Number(fromLocationId)),
                      )
                      .map((dept) => (
                        <SelectItem key={dept.id} value={String(dept.id)}>
                          {dept.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="to-department">To Department *</Label>
                <Select
                  value={toDepartmentId}
                  onValueChange={setToDepartmentId}
                  disabled={!toLocationId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Destination dept" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments
                      .filter(
                        (d) =>
                          !toLocationId || d.location_ids.includes(Number(toLocationId)),
                      )
                      .map((dept) => (
                        <SelectItem key={dept.id} value={String(dept.id)}>
                          {dept.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(movementType === "checkout" || movementType === "transfer") && (
              <div className="space-y-2">
                <Label htmlFor="assignee">Assign To (Person)</Label>
                <Input id="assignee" placeholder="Enter person's name or email" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="expected-date">Expected Date</Label>
              <Input id="expected-date" type="date" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes or reason for movement"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
