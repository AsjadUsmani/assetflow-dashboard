"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, FolderTree } from "lucide-react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import {
  getDepartments,
  updateDepartment,
  type Department,
} from "@/lib/services/departments";
import { getWorkspaceUsers, type WorkspaceUser } from "@/lib/services/workspace-users";

export default function LinkUserDepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingForId, setSavingForId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [depts, wsUsers] = await Promise.all([getDepartments(), getWorkspaceUsers()]);
        if (cancelled) return;
        setDepartments(depts);
        setUsers(wsUsers);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load departments or users");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeUsersWithEmail = useMemo(
    () => users.filter(u => u.is_active && u.email),
    [users],
  );

  const filteredDepartments = useMemo(
    () =>
      departments.filter(d => {
        const term = search.trim().toLowerCase();
        if (!term) return true;
        return (
          d.name.toLowerCase().includes(term) ||
          (d.location_name && d.location_name.toLowerCase().includes(term)) ||
          (d.hod_name && d.hod_name.toLowerCase().includes(term))
        );
      }),
    [departments, search],
  );

  const handleHodChange = async (dept: Department, newHodId: string) => {
    const normalized = newHodId === "__none" ? "" : newHodId;
    const hodId = normalized ? Number(normalized) : null;
    setSavingForId(dept.id);
    try {
      const updated = await updateDepartment(dept.id, { hod_id: hodId ?? undefined });
      setDepartments(prev => prev.map(d => (d.id === dept.id ? updated : d)));
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err instanceof Error ? err.message : "Failed to update department");
    } finally {
      setSavingForId(null);
    }
  };

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Overview", href: "/dashboard" },
          { label: "Departments", href: "/departments" },
          { label: "Link User" },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/departments">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Link User with Department
              </h1>
              <p className="text-sm text-muted-foreground">
                Choose which user is the Head of Department (HOD). If no user is selected, approval
                emails fall back to Admin.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base">Departments &amp; HOD</CardTitle>
                  <CardDescription>
                    {loading
                      ? "Loading..."
                      : `${filteredDepartments.length} department${
                          filteredDepartments.length !== 1 ? "s" : ""
                        } found`}
                  </CardDescription>
                </div>
                <div className="w-full sm:w-64">
                  <Input
                    placeholder="Search by department, location or HOD..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
              {error && (
                <p className="mt-2 text-sm text-destructive">
                  {error}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Head of Department</TableHead>
                    <TableHead>Contact</TableHead>
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
                        No departments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDepartments.map(dept => (
                      <TableRow key={dept.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                              <FolderTree className="size-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{dept.name}</div>
                              {dept.code && (
                                <div className="text-xs text-muted-foreground">
                                  Code: {dept.code}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center gap-1 text-xs">
                              <span>{dept.location_name ?? "—"}</span>
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Select
                              value={dept.hod_id ? String(dept.hod_id) : "__none"}
                              onValueChange={val => handleHodChange(dept, val)}
                              disabled={savingForId === dept.id}
                            >
                              <SelectTrigger className="w-64">
                                <SelectValue placeholder="No HOD (fallback to Admin)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none">
                                  <span className="text-muted-foreground">
                                    No HOD – approvals go to Admin
                                  </span>
                                </SelectItem>
                                {activeUsersWithEmail.map(user => {
                                  const name =
                                    [user.first_name, user.last_name]
                                      .filter(Boolean)
                                      .join(" ") || user.username;
                                  return (
                                    <SelectItem key={user.id} value={String(user.id)}>
                                      <div className="flex items-center gap-2">
                                        <Users className="size-3 text-muted-foreground" />
                                        <div className="flex flex-col">
                                          <span>{name}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {user.email}
                                            {user.role_name ? ` • ${user.role_name}` : ""}
                                          </span>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              {dept.hod_name
                                ? `Current HOD: ${dept.hod_name}`
                                : "No HOD set for this department yet."}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {dept.email && (
                              <span className="text-xs text-muted-foreground">
                                {dept.email}
                              </span>
                            )}
                            {dept.phone && (
                              <Badge variant="outline" className="w-fit text-xs">
                                {dept.phone}
                              </Badge>
                            )}
                          </div>
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

