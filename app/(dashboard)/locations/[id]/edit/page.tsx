"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOrganizations } from "@/lib/services/organizations";
import { getLocationById, updateLocation } from "@/lib/services/locations";
import type { Location } from "@/lib/services/locations";
import type { Organization } from "@/lib/services/organizations";

const COUNTRY_OPTIONS = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "in", label: "India" },
];

export default function EditLocationPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [location, setLocation] = useState<Location | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const numId = Number(id);
    if (Number.isNaN(numId)) {
      setError("Invalid id");
      setLoading(false);
      return;
    }
    Promise.all([getLocationById(numId), getOrganizations()])
      .then(([loc, orgs]) => {
        setLocation(loc ?? null);
        setOrganizations(orgs);
        if (loc) {
          setOrganizationId(String(loc.organization_id));
          setCountryCode(loc.country_code ?? "");
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!location) return;
    setError(null);
    const form = e.currentTarget;
    const orgId = Number(organizationId);
    if (Number.isNaN(orgId)) {
      setError("Please select an organization");
      return;
    }
    const name = (form.querySelector("#name") as HTMLInputElement).value.trim();
    const address = (form.querySelector("#address") as HTMLInputElement).value.trim();
    if (!name || !address) return;
    const city = (form.querySelector("#city") as HTMLInputElement)?.value?.trim() || undefined;
    const state = (form.querySelector("#state") as HTMLInputElement)?.value?.trim() || undefined;
    const postal_code = (form.querySelector("#zip") as HTMLInputElement)?.value?.trim() || undefined;
    const phone = (form.querySelector("#phone") as HTMLInputElement)?.value?.trim() || undefined;
    const email = (form.querySelector("#email") as HTMLInputElement)?.value?.trim() || undefined;
    const notes = (form.querySelector("#notes") as HTMLTextAreaElement)?.value?.trim() || undefined;

    setIsSubmitting(true);
    try {
      await updateLocation(location.id, {
        organization_id: orgId,
        name,
        address,
        city,
        state,
        postal_code,
        country_code: countryCode || undefined,
        phone,
        email,
        notes,
      });
      router.push(`/locations/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Locations", href: "/locations" }, { label: "Edit" }]} />
        <main className="flex-1 overflow-auto p-6">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </>
    );
  }

  if (error || !location) {
    return (
      <>
        <AppHeader breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Locations", href: "/locations" }]} />
        <main className="flex-1 overflow-auto p-6">
          <p className="text-destructive">{error ?? "Location not found"}</p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/locations">Back to Locations</Link>
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
          { label: "Locations", href: "/locations" },
          { label: location.name, href: `/locations/${id}` },
          { label: "Edit" },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/locations/${id}`}>
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Edit Location
              </h1>
              <p className="text-sm text-muted-foreground">
                Update location information
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="size-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Location Details</CardTitle>
                    <CardDescription>
                      Update the information for this location
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization *</Label>
                    <Select value={organizationId} onValueChange={setOrganizationId} required>
                      <SelectTrigger id="organization">
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={String(org.id)}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Location Name *</Label>
                    <Input id="name" defaultValue={location.name} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input id="address" defaultValue={location.address} required />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" defaultValue={location.city ?? ""} placeholder="City" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input id="state" defaultValue={location.state ?? ""} placeholder="State" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">Postal Code</Label>
                    <Input id="zip" defaultValue={location.postal_code ?? ""} placeholder="12345" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_OPTIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      defaultValue={location.phone ?? ""}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={location.email ?? ""}
                      placeholder="location@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional information about this location..."
                    rows={3}
                    defaultValue={location.notes ?? ""}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" type="button" asChild>
                    <Link href={`/locations/${id}`}>Cancel</Link>
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
