"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FolderTree, Search } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { getLocations } from "@/lib/services/locations";
import { getWorkspaceUsers } from "@/lib/services/workspace-users";
import { getDepartmentById, updateDepartment } from "@/lib/services/departments";
import type { Department } from "@/lib/services/departments";
import type { Location } from "@/lib/services/locations";
import type { WorkspaceUser } from "@/lib/services/workspace-users";

export default function EditDepartmentPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [dept, setDept] = useState<Department | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [locationId, setLocationId] = useState<string>("");
  const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);
  const [hodId, setHodId] = useState<string>("none");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedLocation =
    locations.find((loc) => String(loc.id) === locationId) ?? null;

  useEffect(() => {
    const numId = Number(id);
    if (Number.isNaN(numId)) {
      setError("Invalid id");
      setLoading(false);
      return;
    }
    Promise.all([getDepartmentById(numId), getLocations(), getWorkspaceUsers()])
      .then(([d, locs, wsUsers]) => {
        setDept(d ?? null);
        setLocations(locs);
        setUsers(wsUsers.filter((u) => u.is_active));
        if (d) {
          setLocationId(String(d.location_id));
          setHodId(d.hod_id != null ? String(d.hod_id) : "none");
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dept) return;
    setError(null);
    const locId = Number(locationId);
    if (Number.isNaN(locId) || !locationId) {
      setError("Please select a location");
      return;
    }
    const form = e.currentTarget;
    const name = (form.querySelector("#name") as HTMLInputElement).value.trim();
    const phone = (form.querySelector("#phone") as HTMLInputElement)?.value?.trim() || undefined;
    const email = (form.querySelector("#email") as HTMLInputElement)?.value?.trim() || undefined;

    if (!name) return;
    setIsSubmitting(true);
    try {
      await updateDepartment(dept.id, {
        location_id: locId,
        name,
        hod_id: hodId !== "none" ? Number(hodId) : undefined,
        phone,
        email,
      });
      router.push(`/departments/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Departments", href: "/departments" }, { label: "Edit" }]} />
        <main className="flex-1 overflow-auto p-6">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </>
    );
  }

  if (error || !dept) {
    return (
      <>
        <AppHeader breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Departments", href: "/departments" }]} />
        <main className="flex-1 overflow-auto p-6">
          <p className="text-destructive">{error ?? "Department not found"}</p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/departments">Back to Departments</Link>
          </Button>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Overview", href: "/dashboard" },
          { label: "Departments", href: "/departments" },
          { label: dept.name, href: `/departments/${id}` },
          { label: "Edit" },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/departments/${id}`}>
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Edit Department
              </h1>
              <p className="text-sm text-muted-foreground">
                Update department information
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <FolderTree className="size-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Department Details</CardTitle>
                    <CardDescription>
                      Update the information for this department
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Popover
                    open={locationPopoverOpen}
                    onOpenChange={setLocationPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        type="button"
                        className="w-full justify-between"
                        aria-label="Select location"
                      >
                        <span className="truncate text-left">
                          {selectedLocation
                            ? `${selectedLocation.name}${selectedLocation.organization_name ? ` (${selectedLocation.organization_name})` : ""}`
                            : "Search location"}
                        </span>
                        <Search className="ml-2 size-4 shrink-0 opacity-60" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search location by name or organization..." />
                        <CommandList>
                          <CommandEmpty>No locations found.</CommandEmpty>
                          <CommandGroup heading="Locations">
                            {locations.map((loc) => (
                              <CommandItem
                                key={loc.id}
                                value={`${loc.name} ${loc.organization_name ?? ""}`}
                                onSelect={() => {
                                  setLocationId(String(loc.id));
                                  setLocationPopoverOpen(false);
                                }}
                              >
                                {loc.name}{loc.organization_name ? ` (${loc.organization_name})` : ""}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Department Name *</Label>
                  <Input id="name" defaultValue={dept.name} required />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* <div className="space-y-2">
                    <Label>Head of Department</Label>
                    <Select value={hodId} onValueChange={setHodId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not Assigned</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={String(user.id)}>
                            {user.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div> */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Extension</Label>
                    <Input id="phone" defaultValue={dept.phone ?? ""} placeholder="e.g., 969" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Department Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={dept.email ?? ""}
                    placeholder="dept@example.com"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" type="button" asChild>
                    <Link href={`/departments/${id}`}>Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </main>
    </>
  );
}
