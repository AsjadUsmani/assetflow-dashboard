"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  ChevronRight,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
  GitBranch,
} from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { approvalRoutingRules } from "@/lib/mock-data";

const requestTypeLabels: Record<string, string> = {
  create: "Create",
  assign: "Assignment",
  transfer: "Transfer",
  dispose: "Disposal",
  buyback: "Buyback",
  maintenance: "Maintenance",
  return: "Return",
};

const levelColors: Record<string, string> = {
  location: "bg-blue-500/20 text-blue-400",
  regional: "bg-purple-500/20 text-purple-400",
  ho: "bg-amber-500/20 text-amber-400",
};

export default function ApprovalRulesPage() {
  const [rules, setRules] = useState(approvalRoutingRules);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<string | null>(null);

  const toggleRule = (ruleId: string) => {
    setRules(
      rules.map((rule) =>
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  const handleDelete = () => {
    if (selectedRule) {
      setRules(rules.filter((r) => r.id !== selectedRule));
    }
    setDeleteDialogOpen(false);
    setSelectedRule(null);
  };

  const activeRules = rules.filter((r) => r.isActive).length;

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Settings", href: "/settings" },
          { label: "Approval Rules" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              Approval Workflow Rules
            </h1>
            <p className="text-muted-foreground">
              Configure approval routing based on request type, asset category, and value thresholds
            </p>
          </div>
          <Button asChild>
            <Link href="/approval-rules/new">
              <Plus className="mr-2 size-4" />
              New Rule
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Rules</CardDescription>
              <CardTitle className="text-3xl">{rules.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardDescription>Active Rules</CardDescription>
              <CardTitle className="text-3xl text-green-400">{activeRules}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-muted">
            <CardHeader className="pb-2">
              <CardDescription>Inactive Rules</CardDescription>
              <CardTitle className="text-3xl text-muted-foreground">
                {rules.length - activeRules}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Rules Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="size-5" />
              Routing Rules
            </CardTitle>
            <CardDescription>
              Define how requests are routed through the approval hierarchy
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Request Types</TableHead>
                  <TableHead>Approval Chain</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Escalation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        {rule.description && (
                          <p className="text-sm text-muted-foreground">
                            {rule.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {rule.conditions.requestTypes.map((type) => (
                          <Badge
                            key={type}
                            variant="outline"
                            className="text-xs"
                          >
                            {requestTypeLabels[type] || type}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {rule.approvalLevels.map((level, index) => (
                          <div key={index} className="flex items-center">
                            <Badge
                              variant="outline"
                              className={`text-xs capitalize ${levelColors[level.level]}`}
                            >
                              {level.level}
                            </Badge>
                            {index < rule.approvalLevels.length - 1 && (
                              <ChevronRight className="size-3 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {rule.conditions.minValue && (
                          <Badge variant="outline" className="text-xs">
                            Min: ${rule.conditions.minValue.toLocaleString()}
                          </Badge>
                        )}
                        {rule.conditions.assetCategories && (
                          <Badge variant="outline" className="text-xs">
                            {rule.conditions.assetCategories.length} categories
                          </Badge>
                        )}
                        {!rule.conditions.minValue &&
                          !rule.conditions.assetCategories && (
                            <span className="text-muted-foreground">All assets</span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rule.escalationDays ? (
                        <span className="text-sm">
                          {rule.escalationDays} days
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => toggleRule(rule.id)}
                        />
                        <Badge
                          variant="outline"
                          className={
                            rule.isActive
                              ? "bg-green-500/20 text-green-400"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/approval-rules/${rule.id}`}>
                              <Edit className="mr-2 size-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 size-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-400"
                            onClick={() => {
                              setSelectedRule(rule.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Workflow Diagram */}
        <Card>
          <CardHeader>
            <CardTitle>Default Approval Flow</CardTitle>
            <CardDescription>
              Standard approval hierarchy for all requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4 py-8">
              {/* Requester */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                  <span className="text-2xl">👤</span>
                </div>
                <div className="text-center">
                  <p className="font-medium">Requester</p>
                  <p className="text-xs text-muted-foreground">Cinema User</p>
                </div>
              </div>

              <ChevronRight className="size-6 text-muted-foreground" />

              {/* Location HOD */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-16 items-center justify-center rounded-full bg-blue-500/20">
                  <span className="text-2xl">🏢</span>
                </div>
                <div className="text-center">
                  <p className="font-medium">Location HOD</p>
                  <p className="text-xs text-muted-foreground">Admin Head</p>
                </div>
              </div>

              <ChevronRight className="size-6 text-muted-foreground" />

              {/* Regional Team */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-16 items-center justify-center rounded-full bg-purple-500/20">
                  <span className="text-2xl">🌐</span>
                </div>
                <div className="text-center">
                  <p className="font-medium">Regional Team</p>
                  <p className="text-xs text-muted-foreground">Regional Admin</p>
                </div>
              </div>

              <ChevronRight className="size-6 text-muted-foreground" />

              {/* Head Office */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/20">
                  <span className="text-2xl">🏛️</span>
                </div>
                <div className="text-center">
                  <p className="font-medium">Head Office</p>
                  <p className="text-xs text-muted-foreground">Final Authority</p>
                </div>
              </div>

              <ChevronRight className="size-6 text-muted-foreground" />

              {/* Completed */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-16 items-center justify-center rounded-full bg-green-500/20">
                  <CheckCircle className="size-8 text-green-400" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Approved</p>
                  <p className="text-xs text-muted-foreground">Action Taken</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Rule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this approval rule? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
