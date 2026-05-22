"use client";

import { useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  MapPin,
  Edit,
  Building2,
  Phone,
  Mail,
  Calendar,
  Users,
  Package,
  ArrowLeft,
  MoreHorizontal,
  Trash2,
  Globe,
  FileText,
  Navigation,
} from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LocationDepartmentsPanel } from "@/components/locations/location-departments-panel";
import {
  getLocationById,
  getLocationDepartments,
  deleteLocation,
  type Location,
  type LocationDepartment,
} from "@/lib/services/locations";

function InfoField({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
  className?: string;
}) {
  return (
    <div className={`flex gap-3 rounded-lg bg-muted/30 p-3 ${className ?? ""}`}>
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">{value?.trim() ? value : "—"}</p>
      </div>
    </div>
  );
}

const COUNTRY_OPTIONS: Record<string, string> = {
  us: "United States",
  ca: "Canada",
  uk: "United Kingdom",
  au: "Australia",
  de: "Germany",
  fr: "France",
  in: "India",
};

export default function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [departments, setDepartments] = useState<LocationDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    params.then((p) => {
      if (cancelled) return;
      const numId = Number(p.id);
      if (Number.isNaN(numId)) {
        setError("Invalid location id");
        setLoading(false);
        return;
      }
      setId(p.id);
      Promise.all([getLocationById(numId), getLocationDepartments(numId)])
        .then(([loc, depts]) => {
          if (cancelled) return;
          setLocation(loc ?? null);
          setDepartments(depts);
        })
        .catch((err) => {
          if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [params]);

  const handleDelete = async () => {
    if (!id || !location) return;
    if (!confirm("Are you sure you want to delete this location?")) return;
    try {
      await deleteLocation(location.id);
      window.location.href = "/locations";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (loading || id === null) {
    return (
      <>
        <AppHeader breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Locations", href: "/locations" }, { label: "..." }]} />
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
          { label: location.name },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/locations">
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="size-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {location.name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {location.address}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href={`/locations/${id}/edit`}>
                  <Edit className="mr-2 size-4" />
                  Edit
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 size-4" />
                    Delete Location
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Departments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="size-5 text-primary" />
                  <span className="text-2xl font-bold">{location.departments_count ?? departments.length}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Package className="size-5 text-primary" />
                  <span className="text-2xl font-bold">{location.assets_count ?? 0}</span>
                </div>
              </CardContent>
            </Card>
            {/* <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Staff Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="size-5 text-primary" />
                  <span className="text-2xl font-bold">—</span>
                </div>
              </CardContent>
            </Card> */}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
              <CardDescription>Details about this location</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
                <InfoField icon={Building2} label="Organization" value={location.organization_name} />
                <InfoField icon={MapPin} label="Street address" value={location.address} />
                {(location.city || location.state || location.postal_code) && (
                  <InfoField
                    icon={Navigation}
                    label="City / state / postal"
                    value={[location.city, location.state, location.postal_code].filter(Boolean).join(", ")}
                  />
                )}
                {location.country_code && (
                  <InfoField
                    icon={Globe}
                    label="Country"
                    value={COUNTRY_OPTIONS[location.country_code] ?? location.country_code}
                  />
                )}
                <InfoField icon={Phone} label="Phone" value={location.phone} />
                <InfoField icon={Mail} label="Email" value={location.email} />
                {location.notes && (
                  <InfoField icon={FileText} label="Notes" value={location.notes} className="sm:col-span-2" />
                )}
                <InfoField
                  icon={Calendar}
                  label="Created"
                  value={new Date(location.created_at).toLocaleDateString()}
                />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Departments at this venue</CardTitle>
              <CardDescription>
                Teams linked to {location.name} with contact details for this cinema only.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <LocationDepartmentsPanel
                locationId={id}
                locationName={location.name}
                departments={departments}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
