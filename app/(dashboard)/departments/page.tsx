"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FolderTree,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  MapPin,
  Users,
  Package,
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
  getDepartments,
  deleteDepartment,
  type Department,
} from "@/lib/services/departments";
import { apiService } from "@/lib/services/api-service";
import { useToast } from "@/components/ui/use-toast";
import { ImportCsvDialog } from "@/components/import-csv-dialog";

export default function DepartmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { toast } = useToast();

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDepartments();
  }, [loadDepartments]);

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      await deleteDepartment(id);
      setDepartments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleDownloadSampleCsv = useCallback(async () => {
    try {
      const blob = await apiService.getFile("/workspace/departments/sample-csv");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "departments-sample.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Download started", description: "departments-sample.csv" });
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
      const blob = await apiService.getFile("/workspace/departments/export-csv");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "departments-export.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export started", description: "departments-export.csv" });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }, [toast]);

  if (error && !loading && departments.length === 0) {
    return (
      <>
        <AppHeader breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Departments" }]} />
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
          { label: "Departments" },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Departments
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage departments within locations
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
                <Link href="/departments/new">
                  <Plus className="mr-2 size-4" />
                  Add Department
                </Link>
              </Button>
            </div>
          </div>

          <ImportCsvDialog
            open={importDialogOpen}
            onOpenChange={setImportDialogOpen}
            endpoint="/workspace/departments/import-csv"
            title="Import departments from CSV"
            description="Upload a CSV with columns: location_name, name, phone_extension, email. Download sample CSV for exact format."
            sampleFilename="departments-sample.csv"
            onSuccess={loadDepartments}
          />

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base">All Departments</CardTitle>
                  <CardDescription>
                    {loading
                      ? "Loading..."
                      : `${filteredDepartments.length} department${filteredDepartments.length !== 1 ? "s" : ""} found`}
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search departments..."
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
                    <TableHead>Department</TableHead>
                    <TableHead>Location</TableHead>
                    {/* <TableHead>Head of Dept</TableHead> */}
                    {/* <TableHead>Staff</TableHead>
                    <TableHead>Assets</TableHead> */}
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredDepartments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No departments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDepartments.map((dept) => (
                      <TableRow key={dept.id}>
                        <TableCell>
                          <Link
                            href={`/departments/${dept.id}`}
                            className="flex items-center gap-3 hover:underline"
                          >
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                              <FolderTree className="size-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{dept.name}</p>
                              {/* <p className="text-xs text-muted-foreground">
                                Code: {dept.code ?? "—"}
                              </p> */}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="size-4 text-muted-foreground" />
                            <span>{dept.location_name ?? "—"}</span>
                          </div>
                        </TableCell>
                        {/* <TableCell className="text-muted-foreground">
                          {dept.hod_name ?? "Not Assigned"}
                        </TableCell> */}
                        {/* <TableCell>—</TableCell>
                        <TableCell>—</TableCell> */}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/departments/${dept.id}`}>
                                  <Eye className="mr-2 size-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/departments/${dept.id}/edit`}>
                                  <Edit className="mr-2 size-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => handleDelete(dept.id, e)}
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
