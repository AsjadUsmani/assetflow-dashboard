"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Building2,
  Eye,
  FileDown,
  Upload,
  Download,
  ChevronDown,
} from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  getLocations,
  deleteLocation,
  type Location,
} from "@/lib/services/locations";
import { apiService } from "@/lib/services/api-service";
import { useToast } from "@/components/ui/use-toast";
import { ImportCsvDialog } from "@/components/import-csv-dialog";

export default function LocationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { toast } = useToast();

  const loadLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load locations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLocations();
  }, [loadLocations]);

  const filteredLocations = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loc.address && loc.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this location?")) return;
    try {
      await deleteLocation(id);
      setLocations((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleDownloadSampleCsv = useCallback(async () => {
    try {
      const blob = await apiService.getFile("/workspace/locations/sample-csv");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "locations-sample.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Download started", description: "locations-sample.csv" });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }, [toast]);

  const handleExportCsv = useCallback(async () => {
    try {
      const blob = await apiService.getFile("/workspace/locations/export-csv");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "locations-export.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export started", description: "locations-export.csv" });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }, [toast]);

  if (error && !loading && locations.length === 0) {
    return (
      <>
        <AppHeader breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Locations" }]} />
        <main className="flex-1 overflow-auto p-6">
          <p className="text-destructive">{error}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Overview", href: "/dashboard" },
          { label: "Locations" },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Locations
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage organization locations and branches
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    CSV
                    <ChevronDown className="ml-2 size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDownloadSampleCsv}>
                    <FileDown className="mr-2 size-4" />
                    Download sample CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                    <Upload className="mr-2 size-4" />
                    Import from CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportCsv}>
                    <Download className="mr-2 size-4" />
                    Export to CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button asChild>
                <Link href="/locations/new">
                  <Plus className="mr-2 size-4" />
                  Add Location
                </Link>
              </Button>
            </div>
          </div>

          <ImportCsvDialog
            open={importDialogOpen}
            onOpenChange={setImportDialogOpen}
            endpoint="/workspace/locations/import-csv"
            title="Import locations from CSV"
            description="Upload a CSV with columns: organization_name, name, address, city, state, postal_code, country, phone, email, notes. Download sample CSV for exact format."
            sampleFilename="locations-sample.csv"
            onSuccess={loadLocations}
          />

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base">All Locations</CardTitle>
                  <CardDescription>
                    {loading
                      ? "Loading..."
                      : `${filteredLocations.length} location${filteredLocations.length !== 1 ? "s" : ""} found`}
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search locations..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Departments</TableHead>
                    <TableHead>Assets</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredLocations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No locations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLocations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell>
                          <Link
                            href={`/locations/${location.id}`}
                            className="flex items-center gap-3 hover:underline"
                          >
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                              <MapPin className="size-4 text-primary" />
                            </div>
                            <span className="font-medium">{location.name}</span>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="size-4 text-muted-foreground" />
                            <span>{location.organization_name ?? "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {location.address}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {location.departments_count ?? 0} depts
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {location.assets_count ?? 0} assets
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/locations/${location.id}`}>
                                  <Eye className="mr-2 size-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/locations/${location.id}/edit`}>
                                  <Edit className="mr-2 size-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => handleDelete(location.id, e)}
                              >
                                <Trash2 className="mr-2 size-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
