"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  ChevronRight,
  Save,
} from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const requestTypes = [
  { value: "create", label: "Create Asset" },
  { value: "assign", label: "Assignment" },
  { value: "transfer", label: "Transfer" },
  { value: "dispose", label: "Disposal" },
  { value: "buyback", label: "Buyback" },
  { value: "maintenance", label: "Maintenance" },
  { value: "return", label: "Return" },
];

const assetCategories = [
  { value: "it", label: "IT Assets" },
  { value: "projection", label: "Projection" },
  { value: "consumables", label: "Consumables" },
  { value: "spares", label: "Spares / Parts" },
];

const approverRoles = [
  { value: "location_hod", label: "Location HOD" },
  { value: "reporting_person", label: "Reporting Person" },
  { value: "regional_admin", label: "Regional Admin" },
  { value: "ho_admin", label: "HO Admin" },
  { value: "super_admin", label: "Super Admin" },
];

interface ApprovalLevel {
  id: string;
  level: "location" | "regional" | "ho";
  required: boolean;
  approverType: "role" | "user" | "hierarchy";
  approverRoles: string[];
  autoApproveThreshold?: number;
}

export default function NewApprovalRulePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    requestTypes: [] as string[],
    assetCategories: [] as string[],
    minValue: "",
    maxValue: "",
    escalationDays: "3",
    allowParallelApproval: false,
    requireAllApprovers: true,
  });

  const [approvalLevels, setApprovalLevels] = useState<ApprovalLevel[]>([
    {
      id: "1",
      level: "location",
      required: true,
      approverType: "role",
      approverRoles: ["location_hod"],
    },
  ]);

  const toggleRequestType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      requestTypes: prev.requestTypes.includes(type)
        ? prev.requestTypes.filter((t) => t !== type)
        : [...prev.requestTypes, type],
    }));
  };

  const toggleAssetCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      assetCategories: prev.assetCategories.includes(category)
        ? prev.assetCategories.filter((c) => c !== category)
        : [...prev.assetCategories, category],
    }));
  };

  const addApprovalLevel = () => {
    const levels: Array<"location" | "regional" | "ho"> = [
      "location",
      "regional",
      "ho",
    ];
    const existingLevels = approvalLevels.map((l) => l.level);
    const nextLevel = levels.find((l) => !existingLevels.includes(l));

    if (nextLevel) {
      setApprovalLevels([
        ...approvalLevels,
        {
          id: Date.now().toString(),
          level: nextLevel,
          required: true,
          approverType: "role",
          approverRoles: [],
        },
      ]);
    }
  };

  const removeApprovalLevel = (id: string) => {
    setApprovalLevels(approvalLevels.filter((l) => l.id !== id));
  };

  const updateApprovalLevel = (
    id: string,
    updates: Partial<ApprovalLevel>
  ) => {
    setApprovalLevels(
      approvalLevels.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  const handleSubmit = () => {
    // In real app, this would call an API
    router.push("/approval-rules");
  };

  const levelColors: Record<string, string> = {
    location: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    regional: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    ho: "bg-amber-500/20 text-amber-400 border-amber-500/50",
  };

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Approval Rules", href: "/approval-rules" },
          { label: "New Rule" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/approval-rules">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create Approval Rule
            </h1>
            <p className="text-muted-foreground">
              Define conditions and approval chain for asset requests
            </p>
          </div>
          <Button onClick={handleSubmit}>
            <Save className="mr-2 size-4" />
            Save Rule
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Rule Name</Label>
                    <Input
                      placeholder="e.g., Standard Transfer Approval"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isActive: checked })
                        }
                      />
                      <Label>Active</Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe when this rule should be applied..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Conditions */}
            <Card>
              <CardHeader>
                <CardTitle>Conditions</CardTitle>
                <CardDescription>
                  Define when this rule should be triggered
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Request Types */}
                <div className="space-y-3">
                  <Label>Request Types</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {requestTypes.map((type) => (
                      <label
                        key={type.value}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-accent ${
                          formData.requestTypes.includes(type.value)
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                      >
                        <Checkbox
                          checked={formData.requestTypes.includes(type.value)}
                          onCheckedChange={() => toggleRequestType(type.value)}
                        />
                        <span className="text-sm">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Asset Categories */}
                <div className="space-y-3">
                  <Label>Asset Categories (Optional)</Label>
                  <p className="text-sm text-muted-foreground">
                    Leave empty to apply to all categories
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {assetCategories.map((cat) => (
                      <label
                        key={cat.value}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-accent ${
                          formData.assetCategories.includes(cat.value)
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                      >
                        <Checkbox
                          checked={formData.assetCategories.includes(cat.value)}
                          onCheckedChange={() => toggleAssetCategory(cat.value)}
                        />
                        <span className="text-sm">{cat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Value Thresholds */}
                <div className="space-y-3">
                  <Label>Value Thresholds (Optional)</Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Minimum Value ($)
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.minValue}
                        onChange={(e) =>
                          setFormData({ ...formData, minValue: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Maximum Value ($)
                      </Label>
                      <Input
                        type="number"
                        placeholder="No limit"
                        value={formData.maxValue}
                        onChange={(e) =>
                          setFormData({ ...formData, maxValue: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approval Chain */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Approval Chain</CardTitle>
                    <CardDescription>
                      Configure the approval levels and approvers
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addApprovalLevel}
                    disabled={approvalLevels.length >= 3}
                  >
                    <Plus className="mr-2 size-4" />
                    Add Level
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {approvalLevels.map((level, index) => (
                  <div
                    key={level.id}
                    className={`rounded-lg border p-4 ${levelColors[level.level]}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="size-4 cursor-grab text-muted-foreground" />
                        <Badge variant="outline" className="capitalize">
                          Level {index + 1}: {level.level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={level.required}
                            onCheckedChange={(checked) =>
                              updateApprovalLevel(level.id, {
                                required: !!checked,
                              })
                            }
                          />
                          <span className="text-sm">Required</span>
                        </div>
                        {approvalLevels.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeApprovalLevel(level.id)}
                          >
                            <Trash2 className="size-4 text-red-400" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm">Approval Level</Label>
                        <Select
                          value={level.level}
                          onValueChange={(v: "location" | "regional" | "ho") =>
                            updateApprovalLevel(level.id, { level: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="location">Location Level</SelectItem>
                            <SelectItem value="regional">Regional Level</SelectItem>
                            <SelectItem value="ho">Head Office Level</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Approver Type</Label>
                        <Select
                          value={level.approverType}
                          onValueChange={(v: "role" | "user" | "hierarchy") =>
                            updateApprovalLevel(level.id, { approverType: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="role">By Role</SelectItem>
                            <SelectItem value="hierarchy">By Hierarchy</SelectItem>
                            <SelectItem value="user">Specific User</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {level.approverType === "role" && (
                      <div className="mt-4 space-y-2">
                        <Label className="text-sm">Approver Roles</Label>
                        <div className="flex flex-wrap gap-2">
                          {approverRoles.map((role) => (
                            <label
                              key={role.value}
                              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-background/50 ${
                                level.approverRoles.includes(role.value)
                                  ? "border-foreground bg-background/50"
                                  : "border-dashed"
                              }`}
                            >
                              <Checkbox
                                checked={level.approverRoles.includes(role.value)}
                                onCheckedChange={(checked) => {
                                  updateApprovalLevel(level.id, {
                                    approverRoles: checked
                                      ? [...level.approverRoles, role.value]
                                      : level.approverRoles.filter(
                                          (r) => r !== role.value
                                        ),
                                  });
                                }}
                              />
                              {role.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Escalation Days</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.escalationDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          escalationDays: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Days before escalating to next level
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require All Approvers</Label>
                      <p className="text-sm text-muted-foreground">
                        All approvers at each level must approve
                      </p>
                    </div>
                    <Switch
                      checked={formData.requireAllApprovers}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, requireAllApprovers: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Parallel Approval</Label>
                      <p className="text-sm text-muted-foreground">
                        Multiple levels can approve simultaneously
                      </p>
                    </div>
                    <Switch
                      checked={formData.allowParallelApproval}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, allowParallelApproval: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  Visual representation of the approval flow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {approvalLevels.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground">
                      Add approval levels to see the flow
                    </p>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      {/* Start */}
                      <div className="rounded-full bg-muted px-4 py-2 text-sm">
                        Request Created
                      </div>
                      <div className="h-4 w-0.5 bg-border" />

                      {approvalLevels.map((level, index) => (
                        <div
                          key={level.id}
                          className="flex w-full flex-col items-center"
                        >
                          <div
                            className={`w-full rounded-lg border p-3 text-center ${levelColors[level.level]}`}
                          >
                            <p className="font-medium capitalize">
                              {level.level} Approval
                            </p>
                            {level.approverRoles.length > 0 && (
                              <p className="text-xs">
                                {level.approverRoles
                                  .map(
                                    (r) =>
                                      approverRoles.find((ar) => ar.value === r)
                                        ?.label
                                  )
                                  .join(", ")}
                              </p>
                            )}
                          </div>
                          {index < approvalLevels.length - 1 && (
                            <div className="flex h-6 items-center">
                              <ChevronRight className="size-4 rotate-90 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="h-4 w-0.5 bg-border" />
                      {/* End */}
                      <div className="rounded-full bg-green-500/20 px-4 py-2 text-sm text-green-400">
                        Approved
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Request Types</span>
                  <span>{formData.requestTypes.length || "None"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asset Categories</span>
                  <span>{formData.assetCategories.length || "All"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approval Levels</span>
                  <span>{approvalLevels.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Escalation</span>
                  <span>{formData.escalationDays} days</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
