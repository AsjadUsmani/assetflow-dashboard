"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  Edit,
  Trash2,
  ArrowRightLeft,
  UserPlus,
  Settings,
  Shield,
  LogIn,
  LogOut,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const actionIcons = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  transfer: ArrowRightLeft,
  assign: UserPlus,
  settings: Settings,
  permission: Shield,
  login: LogIn,
  logout: LogOut,
};

const actionColors = {
  create: "bg-success/20 text-success",
  update: "bg-primary/20 text-primary",
  delete: "bg-destructive/20 text-destructive",
  transfer: "bg-chart-2/20 text-chart-2",
  assign: "bg-chart-3/20 text-chart-3",
  settings: "bg-muted text-muted-foreground",
  permission: "bg-warning/20 text-warning",
  login: "bg-success/20 text-success",
  logout: "bg-muted text-muted-foreground",
};

const mockAuditLogs = [
  {
    id: "1",
    action: "create",
    entityType: "Asset",
    entityName: "MacBook Pro 16\"",
    entityId: "AST-001",
    user: { name: "John Smith", email: "john@company.com" },
    timestamp: "2024-01-15T10:30:00Z",
    ipAddress: "192.168.1.105",
    details: {
      fields: ["name", "serial_number", "purchase_date", "value"],
    },
  },
  {
    id: "2",
    action: "transfer",
    entityType: "Asset",
    entityName: "Dell Monitor 27\"",
    entityId: "AST-002",
    user: { name: "Sarah Chen", email: "sarah@company.com" },
    timestamp: "2024-01-15T09:45:00Z",
    ipAddress: "192.168.1.112",
    details: {
      from: { location: "HQ", department: "Engineering" },
      to: { location: "Branch Office", department: "Marketing" },
    },
  },
  {
    id: "3",
    action: "update",
    entityType: "Asset Type",
    entityName: "Laptop",
    entityId: "TYPE-001",
    user: { name: "Admin User", email: "admin@company.com" },
    timestamp: "2024-01-15T09:00:00Z",
    ipAddress: "192.168.1.100",
    details: {
      changes: [
        { field: "depreciation_rate", old: "20%", new: "25%" },
        { field: "warranty_period", old: "12 months", new: "24 months" },
      ],
    },
  },
  {
    id: "4",
    action: "assign",
    entityType: "Asset",
    entityName: "iPhone 15 Pro",
    entityId: "AST-003",
    user: { name: "HR Manager", email: "hr@company.com" },
    timestamp: "2024-01-14T16:20:00Z",
    ipAddress: "192.168.1.108",
    details: {
      assignedTo: "Michael Brown",
      department: "Sales",
    },
  },
  {
    id: "5",
    action: "delete",
    entityType: "Asset",
    entityName: "Old Printer HP",
    entityId: "AST-099",
    user: { name: "Admin User", email: "admin@company.com" },
    timestamp: "2024-01-14T14:10:00Z",
    ipAddress: "192.168.1.100",
    details: {
      reason: "Disposed - End of life",
    },
  },
  {
    id: "6",
    action: "permission",
    entityType: "User",
    entityName: "Emily Davis",
    entityId: "USR-005",
    user: { name: "Super Admin", email: "superadmin@company.com" },
    timestamp: "2024-01-14T11:30:00Z",
    ipAddress: "192.168.1.101",
    details: {
      changes: [{ field: "role", old: "Staff", new: "HOD" }],
    },
  },
  {
    id: "7",
    action: "login",
    entityType: "Session",
    entityName: "User Login",
    entityId: "SES-001",
    user: { name: "John Smith", email: "john@company.com" },
    timestamp: "2024-01-14T08:00:00Z",
    ipAddress: "192.168.1.105",
    details: {
      device: "Chrome on MacOS",
      location: "San Francisco, CA",
    },
  },
  {
    id: "8",
    action: "settings",
    entityType: "Organization",
    entityName: "Company Settings",
    entityId: "ORG-001",
    user: { name: "Admin User", email: "admin@company.com" },
    timestamp: "2024-01-13T15:45:00Z",
    ipAddress: "192.168.1.100",
    details: {
      changes: [
        { field: "default_currency", old: "USD", new: "EUR" },
      ],
    },
  },
];

type AuditLog = (typeof mockAuditLogs)[0];

export function AuditLogsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch =
      log.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesEntity =
      entityFilter === "all" || log.entityType === entityFilter;
    return matchesSearch && matchesAction && matchesEntity;
  });

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  return (
    <>
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Events (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Asset Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              Creates, updates, deletes
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              User Logins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Active sessions: 42</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Security Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Permission changes today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-secondary border-0"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40 bg-secondary border-0">
              <Filter className="mr-2 size-4" />
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="assign">Assign</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="permission">Permission</SelectItem>
            </SelectContent>
          </Select>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-40 bg-secondary border-0">
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              <SelectItem value="Asset">Asset</SelectItem>
              <SelectItem value="Asset Type">Asset Type</SelectItem>
              <SelectItem value="User">User</SelectItem>
              <SelectItem value="Session">Session</SelectItem>
              <SelectItem value="Organization">Organization</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            className="w-40 bg-secondary border-0"
            defaultValue="2024-01-15"
          />
        </div>
        <Button variant="outline">
          <Download className="mr-2 size-4" />
          Export Logs
        </Button>
      </div>

      {/* Logs Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>User</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => {
              const ActionIcon =
                actionIcons[log.action as keyof typeof actionIcons];
              const actionColor =
                actionColors[log.action as keyof typeof actionColors];

              return (
                <TableRow
                  key={log.id}
                  className="border-border hover:bg-secondary/50"
                >
                  <TableCell>
                    <div className="text-sm">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={actionColor}>
                      <ActionIcon className="mr-1 size-3" />
                      {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{log.entityName}</div>
                    <div className="text-xs text-muted-foreground">
                      {log.entityType} - {log.entityId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {log.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm">{log.user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {log.user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-secondary px-2 py-1 rounded">
                      {log.ipAddress}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => handleViewDetails(log)}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Full details of this audit event
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Action</p>
                  <Badge
                    variant="outline"
                    className={
                      actionColors[
                        selectedLog.action as keyof typeof actionColors
                      ]
                    }
                  >
                    {selectedLog.action.charAt(0).toUpperCase() +
                      selectedLog.action.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p className="font-medium">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entity</p>
                  <p className="font-medium">{selectedLog.entityName}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedLog.entityType} - {selectedLog.entityId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User</p>
                  <p className="font-medium">{selectedLog.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedLog.user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IP Address</p>
                  <code className="text-sm bg-secondary px-2 py-1 rounded">
                    {selectedLog.ipAddress}
                  </code>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Details</p>
                <pre className="text-xs bg-secondary p-3 rounded-lg overflow-auto max-h-40">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
