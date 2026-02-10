"use client";

import {
  Shield,
  Users,
  Settings,
  Eye,
  Edit,
  Plus,
  Trash2,
  Check,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockUsers } from "@/lib/mock-data";

const roles = [
  {
    id: "super-admin",
    name: "Super Admin",
    description: "Full system access across all organizations",
    color: "bg-destructive/20 text-destructive border-destructive/30",
    icon: Shield,
    userCount: 2,
    permissions: {
      dashboard: ["view", "export"],
      assets: ["view", "create", "edit", "delete", "transfer", "dispose"],
      assetTypes: ["view", "create", "edit", "delete"],
      workflows: ["view", "create", "approve", "reject", "override"],
      movements: ["view", "create", "approve", "reject"],
      users: ["view", "create", "edit", "delete"],
      roles: ["view", "create", "edit", "delete"],
      reports: ["view", "create", "export"],
      auditLogs: ["view", "export"],
      settings: ["view", "edit"],
    },
  },
  {
    id: "ho-admin",
    name: "HO Admin",
    description: "Head Office administrator with final approval authority",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    icon: Shield,
    userCount: 3,
    permissions: {
      dashboard: ["view", "export"],
      assets: ["view", "create", "edit", "delete", "transfer", "dispose"],
      assetTypes: ["view", "create", "edit"],
      workflows: ["view", "create", "approve", "reject"],
      movements: ["view", "create", "approve", "reject"],
      users: ["view", "create", "edit"],
      roles: ["view"],
      reports: ["view", "create", "export"],
      auditLogs: ["view", "export"],
      settings: ["view", "edit"],
    },
  },
  {
    id: "regional-admin",
    name: "Regional Team",
    description: "Regional manager with intermediate approval authority",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    icon: Settings,
    userCount: 8,
    permissions: {
      dashboard: ["view", "export"],
      assets: ["view", "create", "edit", "transfer"],
      assetTypes: ["view"],
      workflows: ["view", "create", "approve"],
      movements: ["view", "create", "approve"],
      users: ["view"],
      roles: [],
      reports: ["view", "export"],
      auditLogs: ["view"],
      settings: ["view"],
    },
  },
  {
    id: "cinema-manager",
    name: "Cinema Manager",
    description: "Location manager who can initiate requests",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: Users,
    userCount: 24,
    permissions: {
      dashboard: ["view"],
      assets: ["view", "request"],
      assetTypes: ["view"],
      workflows: ["view", "create"],
      movements: ["view", "request"],
      users: ["view"],
      roles: [],
      reports: ["view"],
      auditLogs: [],
      settings: [],
    },
  },
  {
    id: "cinema-user",
    name: "Cinema User",
    description: "View-only access to assigned assets",
    color: "bg-muted text-muted-foreground border-border",
    icon: Eye,
    userCount: 156,
    permissions: {
      dashboard: ["view"],
      assets: ["view"],
      assetTypes: ["view"],
      workflows: ["view"],
      movements: ["view"],
      users: [],
      roles: [],
      reports: [],
      auditLogs: [],
      settings: [],
    },
  },
];

const permissionModules = [
  { key: "dashboard", label: "Dashboard" },
  { key: "assets", label: "Assets" },
  { key: "assetTypes", label: "Asset Types" },
  { key: "workflows", label: "Workflows" },
  { key: "movements", label: "Movements" },
  { key: "users", label: "Users" },
  { key: "roles", label: "Roles" },
  { key: "reports", label: "Reports" },
  { key: "auditLogs", label: "Audit Logs" },
  { key: "settings", label: "Settings" },
];

export function RolesList() {
  return (
    <div className="space-y-6">
      {/* Role Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <Card key={role.id} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${role.color.split(" ")[0]}`}>
                      <Icon className={`size-5 ${role.color.split(" ")[1]}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{role.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {role.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="size-8">
                    <Edit className="size-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={role.color}>
                    {role.userCount} users
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {Object.values(role.permissions).flat().length} permissions
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {/* Add New Role Card */}
        <Card className="bg-card border-border border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[140px] gap-2">
            <div className="p-2 rounded-lg bg-secondary">
              <Plus className="size-5 text-muted-foreground" />
            </div>
            <Button variant="ghost" size="sm">
              Create Custom Role
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Permissions Matrix */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Permission Matrix</CardTitle>
          <CardDescription>
            Overview of permissions by role and module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="sticky left-0 bg-card">Module</TableHead>
                  {roles.map((role) => (
                    <TableHead key={role.id} className="text-center min-w-24">
                      <Badge variant="outline" className={role.color}>
                        {role.name}
                      </Badge>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissionModules.map((module) => (
                  <TableRow
                    key={module.key}
                    className="border-border hover:bg-secondary/50"
                  >
                    <TableCell className="sticky left-0 bg-card font-medium">
                      {module.label}
                    </TableCell>
                    {roles.map((role) => {
                      const perms =
                        role.permissions[
                          module.key as keyof typeof role.permissions
                        ];
                      return (
                        <TableCell key={role.id} className="text-center">
                          {perms.length > 0 ? (
                            <div className="flex flex-wrap justify-center gap-1">
                              {perms.includes("view") && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1 py-0 bg-secondary/50"
                                >
                                  View
                                </Badge>
                              )}
                              {perms.includes("create") && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1 py-0 bg-success/20 text-success border-success/30"
                                >
                                  Create
                                </Badge>
                              )}
                              {perms.includes("edit") && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1 py-0 bg-primary/20 text-primary border-primary/30"
                                >
                                  Edit
                                </Badge>
                              )}
                              {perms.includes("delete") && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1 py-0 bg-destructive/20 text-destructive border-destructive/30"
                                >
                                  Delete
                                </Badge>
                              )}
                              {perms.includes("approve") && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1 py-0 bg-chart-2/20 text-chart-2 border-chart-2/30"
                                >
                                  Approve
                                </Badge>
                              )}
                              {perms.includes("export") && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1 py-0 bg-chart-3/20 text-chart-3 border-chart-3/30"
                                >
                                  Export
                                </Badge>
                              )}
                              {perms.includes("request") && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1 py-0 bg-blue-500/20 text-blue-400 border-blue-500/30"
                                >
                                  Request
                                </Badge>
                              )}
                              {perms.includes("dispose") && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1 py-0 bg-red-500/20 text-red-400 border-red-500/30"
                                >
                                  Dispose
                                </Badge>
                              )}
                              {perms.includes("override") && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1 py-0 bg-purple-500/20 text-purple-400 border-purple-500/30"
                                >
                                  Override
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <X className="size-4 mx-auto text-muted-foreground/50" />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
