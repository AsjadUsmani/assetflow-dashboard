"use client";

import { useEffect, useState } from "react";
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
  Hash,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLocationById, deleteLocation, type Location } from "@/lib/services/locations";
import { getDepartments, type Department } from "@/lib/services/departments";

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
  const [departments, setDepartments] = useState<Department[]>([]);
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
      Promise.all([getLocationById(numId), getDepartments(numId)])
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
                  <span className="text-2xl font-bold">{departments.length}</span>
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

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Location Information</CardTitle>
                <CardDescription>Details about this location</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Organization</p>
                    <p className="text-sm text-muted-foreground">
                      {location.organization_name ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Street Address</p>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                  </div>
                </div>
                {(location.city || location.state || location.postal_code) && (
                  <div className="flex items-start gap-3">
                    <Navigation className="mt-0.5 size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">City / State / Postal</p>
                      <p className="text-sm text-muted-foreground">
                        {[location.city, location.state, location.postal_code]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </p>
                    </div>
                  </div>
                )}
                {location.country_code && (
                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Country</p>
                      <p className="text-sm text-muted-foreground">
                        {COUNTRY_OPTIONS[location.country_code] ?? location.country_code}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{location.phone ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{location.email ?? "—"}</p>
                  </div>
                </div>
                {location.notes && (
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Notes</p>
                      <p className="text-sm text-muted-foreground">{location.notes}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(location.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Departments</CardTitle>
                    <CardDescription>Departments at this location</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/departments/new">Add Department</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {departments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Assets</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departments.slice(0, 5).map((dept) => (
                        <TableRow key={dept.id}>
                          <TableCell>
                            <Link
                              href={`/departments/${dept.id}`}
                              className="font-medium hover:underline"
                            >
                              {dept.name}
                            </Link>
                          </TableCell>
                          <TableCell>{dept.assets_count ?? 0}</TableCell>
                          <TableCell>Active</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="mb-2 size-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No departments yet</p>
                    <Button size="sm" className="mt-4" asChild>
                      <Link href="/departments/new">Add First Department</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
