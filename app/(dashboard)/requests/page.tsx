"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Filter,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  ArrowRight,
} from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRequests, type AssetRequest } from "@/lib/services/requests";

const statusConfig = {
  draft: { label: "Draft", icon: FileText, color: "bg-muted text-muted-foreground" },
  pending: { label: "Pending", icon: Clock, color: "bg-amber-500/20 text-amber-400" },
  in_review: { label: "In Review", icon: AlertCircle, color: "bg-blue-500/20 text-blue-400" },
  approved: { label: "Approved", icon: CheckCircle, color: "bg-green-500/20 text-green-400" },
  rejected: { label: "Rejected", icon: XCircle, color: "bg-red-500/20 text-red-400" },
  completed: { label: "Completed", icon: CheckCircle, color: "bg-primary/20 text-primary" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-muted text-muted-foreground" },
};

const typeConfig = {
  create: { label: "Create", color: "bg-primary/20 text-primary" },
  assign: { label: "Assignment", color: "bg-blue-500/20 text-blue-400" },
  transfer: { label: "Transfer", color: "bg-purple-500/20 text-purple-400" },
  dispose: { label: "Disposal", color: "bg-red-500/20 text-red-400" },
  buyback: { label: "Buyback", color: "bg-amber-500/20 text-amber-400" },
  maintenance: { label: "Maintenance", color: "bg-orange-500/20 text-orange-400" },
  return: { label: "Return", color: "bg-green-500/20 text-green-400" },
};

const priorityConfig = {
  low: { label: "Low", color: "text-muted-foreground" },
  medium: { label: "Medium", color: "text-blue-400" },
  high: { label: "High", color: "text-amber-400" },
  urgent: { label: "Urgent", color: "text-red-400" },
};

const defaultStatusConfig = {
  label: "Unknown",
  icon: AlertCircle,
  color: "bg-muted text-muted-foreground",
};

const defaultTypeConfig = {
  label: "Unknown",
  color: "bg-muted text-muted-foreground",
};

const defaultPriorityConfig = {
  label: "Unknown",
  color: "text-muted-foreground",
};

function isStatusKey(value: string): value is keyof typeof statusConfig {
  return value in statusConfig;
}

function isTypeKey(value: string): value is keyof typeof typeConfig {
  return value in typeConfig;
}

function isPriorityKey(value: string): value is keyof typeof priorityConfig {
  return value in priorityConfig;
}

export default function RequestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  const [requests, setRequests] = useState<AssetRequest[]>([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getRequests();
        if (isMounted) setRequests(data);
      } catch {
        // swallow for now - global handler will surface toast
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.request_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.asset_name ?? "New Asset").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.type === typeFilter;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && ["pending", "in_review"].includes(request.status)) ||
      (activeTab === "approved" && request.status === "approved") ||
      (activeTab === "rejected" && request.status === "rejected");

    return matchesSearch && matchesStatus && matchesType && matchesTab;
  });

  const pendingCount = requests.filter((r) =>
    ["pending", "in_review"].includes(r.status)
  ).length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Asset Requests" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              Asset Requests
            </h1>
            <p className="text-muted-foreground">
              Create, track, and manage all asset-related requests through the approval workflow
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" />
                New Request
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/requests/new?type=create">Create Asset</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/requests/new?type=assign">Assign Asset</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/requests/new?type=transfer">Transfer Asset</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/requests/new?type=dispose">Dispose Asset</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/requests/new?type=buyback">Buyback Asset</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/requests/new?type=maintenance">Maintenance Request</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardDescription>Pending Approval</CardDescription>
              <CardTitle className="text-3xl">{pendingCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardDescription>Approved</CardDescription>
              <CardTitle className="text-3xl">{approvedCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ready for action
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardDescription>Rejected</CardDescription>
              <CardTitle className="text-3xl">{rejectedCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Requires revision
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardDescription>Total Requests</CardDescription>
              <CardTitle className="text-3xl">{requests.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Input
                  placeholder="Search by request number, asset, or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4"
                />
              </div>
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Request Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="assign">Assignment</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="dispose">Disposal</SelectItem>
                    <SelectItem value="buyback">Buyback</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="size-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs and Table */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Stage</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const status = isStatusKey(request.status)
                      ? statusConfig[request.status]
                      : defaultStatusConfig;
                    const type = isTypeKey(request.type)
                      ? typeConfig[request.type]
                      : defaultTypeConfig;
                    const priority = isPriorityKey(request.priority)
                      ? priorityConfig[request.priority]
                      : defaultPriorityConfig;
                    const StatusIcon = status.icon;

                    return (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.request_number}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={type.color}>
                            {type.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{request.asset_name ?? "New Asset"}</TableCell>
                        <TableCell className="max-w-48 truncate">
                          {request.reason}
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${priority.color}`}>
                            {priority.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={status.color}>
                            <StatusIcon className="mr-1 size-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {request.current_approval_level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/requests/${request.id}`}>
                              View
                              <ArrowRight className="ml-1 size-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="size-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No requests found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
