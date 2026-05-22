"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderTree,
  Edit,
  Calendar,
  ArrowLeft,
  MoreHorizontal,
  Trash2,
  Package,
  Building2,
} from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { DepartmentVenuesPanel } from "@/components/departments/department-venues-panel";
import { getDepartmentById, deleteDepartment } from "@/lib/services/departments";
import type { Department } from "@/lib/services/departments";

export default function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);
  const [dept, setDept] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    params.then((p) => {
      if (cancelled) return;
      const numId = Number(p.id);
      if (Number.isNaN(numId)) {
        setError("Invalid department id");
        setLoading(false);
        return;
      }
      setId(p.id);
      getDepartmentById(numId)
        .then((d) => {
          if (!cancelled) setDept(d ?? null);
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
    if (!id || !dept) return;
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      await deleteDepartment(dept.id);
      window.location.href = "/departments";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (loading || id === null) {
    return (
      <>
        <AppHeader breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Departments", href: "/departments" }, { label: "..." }]} />
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

  const venueCount = dept.venue_contacts.length || dept.location_names.length;

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Overview", href: "/dashboard" },
          { label: "Departments", href: "/departments" },
          { label: dept.name },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <Button variant="ghost" size="icon" asChild className="mt-1 shrink-0">
                <Link href="/departments">
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
              <div className="flex items-start gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/15">
                  <FolderTree className="size-7 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">{dept.name}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {dept.code ? (
                      <Badge variant="outline">{dept.code}</Badge>
                    ) : null}
                    <Badge variant="secondary" className="gap-1">
                      <Building2 className="size-3" />
                      {venueCount} venues
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Package className="size-3" />
                      {dept.assets_count ?? 0} assets
                    </Badge>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    Created {new Date(dept.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:ml-auto">
              <Button asChild>
                <Link href={`/departments/${id}/edit`}>
                  <Edit className="mr-2 size-4" />
                  Edit department
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 size-4" />
                    Delete department
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Venues & contact</CardTitle>
              <CardDescription>
                Each cinema location where this department operates, with venue-specific phone and email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DepartmentVenuesPanel dept={dept} />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
