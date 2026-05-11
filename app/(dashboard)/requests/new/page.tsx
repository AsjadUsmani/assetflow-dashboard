"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
} from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createRequest, CREATE_ASSET_NAME_MARKER } from "@/lib/services/requests";
import { getAssets, type Asset } from "@/lib/services/assets";
import { getLocations, type Location } from "@/lib/services/locations";
import { getDepartments, type Department } from "@/lib/services/departments";
import { getWorkspaceUsers, type WorkspaceUser } from "@/lib/services/workspace-users";
import { getAssetTypes, type AssetType } from "@/lib/services/asset-types";

const requestTypes = [
  {
    value: "create",
    label: "Create Asset",
    description: "Register a new asset in the system",
  },
  {
    value: "assign",
    label: "Assign Asset",
    description: "Assign an existing asset to a user",
  },
  {
    value: "transfer",
    label: "Transfer Asset",
    description: "Move asset between locations or departments",
  },
  {
    value: "dispose",
    label: "Dispose Asset",
    description: "Remove asset from inventory",
  },
  {
    value: "buyback",
    label: "Buyback Asset",
    description: "Employee purchase of assigned asset",
  },
  {
    value: "maintenance",
    label: "Maintenance Request",
    description: "Send asset for repair or maintenance",
  },
];

function NewRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeFromUrl = searchParams.get("type");

  const [step, setStep] = useState(1);
  const [requestType, setRequestType] = useState(typeFromUrl || "");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [formData, setFormData] = useState({
    // Asset details (for create)
    assetName: "",
    assetTypeId: "",
    category: "",
    serialNumber: "",

    // Transfer/Assignment details
    fromLocationId: "",
    toLocationId: "",
    fromDepartmentId: "",
    toDepartmentId: "",
    toUserId: "",

    // Request details
    reason: "",
    justification: "",
    priority: "medium",
    documents: [] as string[],
  });

  useEffect(() => {
    if (typeFromUrl) {
      setRequestType(typeFromUrl);
      setStep(2);
    }
  }, [typeFromUrl]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [assetList, locationList, departmentList, userList, assetTypeList] =
          await Promise.all([
          getAssets(),
          getLocations(),
          getDepartments(),
          getWorkspaceUsers(),
          getAssetTypes(),
        ]);
        if (!isMounted) return;
        setAssets(assetList);
        setLocations(locationList);
        setDepartments(departmentList);
        setUsers(userList);
        setAssetTypes(assetTypeList);
      } catch {
        // swallow; global handler can surface toast separately
      } finally {
        if (isMounted) setLoadingLookups(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 2 && typeFromUrl) {
      router.push("/requests");
    } else if (step === 2 && !typeFromUrl) {
      setStep(1);
    } else if (step > 2) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    // Create a backend request with full linkage (asset, locations, departments, user).
    try {
      const asset = selectedAsset
        ? assets.find((a) => String(a.id) === selectedAsset)
        : null;

      const body: Parameters<typeof createRequest>[0] = {
        type: requestType,
        priority: formData.priority,
        reason: formData.reason,
        justification: formData.justification || undefined,
      };

      if (requestType === "create" && formData.assetName.trim()) {
        const encoded = [
          `${CREATE_ASSET_NAME_MARKER}${formData.assetName.trim()}`,
          formData.justification?.trim()
]       .filter(Boolean).join("\n");
        body.justification = encoded;
      }

      if (asset) {
        body.asset_id = asset.id;
        if (asset.location_id != null) body.from_location_id = asset.location_id;
        if (asset.department_id != null) body.from_department_id = asset.department_id;
      }

      if (requestType === "transfer" || requestType === "assign") {
        if (formData.toLocationId) {
          body.to_location_id = Number(formData.toLocationId);
        }
        if (formData.toDepartmentId) {
          body.to_department_id = Number(formData.toDepartmentId);
        }
      }

      if (requestType === "assign" && formData.toUserId) {
        body.to_user_id = Number(formData.toUserId);
      }

      await createRequest(body);
    } finally {
      router.push("/requests");
    }
  };

  const selectedAssetData = selectedAsset
    ? assets.find((a) => String(a.id) === selectedAsset)
    : null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/requests">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New Request</h1>
          <p className="text-muted-foreground">
            Create a new asset request for approval
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                s < step
                  ? "bg-primary text-primary-foreground"
                  : s === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {s < step ? <CheckCircle className="size-4" /> : s}
            </div>
            {s < 4 && (
              <div
                className={`mx-2 h-0.5 w-12 ${
                  s < step ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Request Type */}
      {step === 1 && (
        <Card className="mx-auto w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Select Request Type</CardTitle>
            <CardDescription>
              What type of asset request do you want to create?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={requestType}
              onValueChange={setRequestType}
              className="grid gap-3"
            >
              {requestTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent ${
                    requestType === type.value
                      ? "border-primary bg-primary/5"
                      : ""
                  }`}
                >
                  <RadioGroupItem value={type.value} />
                  <div>
                    <p className="font-medium">{type.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </label>
              ))}
            </RadioGroup>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleNext} disabled={!requestType}>
                Continue
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Asset Selection */}
      {step === 2 && (
        <Card className="mx-auto w-full max-w-2xl">
          <CardHeader>
            <CardTitle>
              {requestType === "create" ? "Asset Details" : "Select Asset"}
            </CardTitle>
            <CardDescription>
              {requestType === "create"
                ? "Enter the details for the new asset"
                : "Choose the asset for this request"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {requestType === "create" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Asset Name</Label>
                    <Input
                      placeholder="e.g., MacBook Pro 16-inch"
                      value={formData.assetName}
                      onChange={(e) =>
                        setFormData({ ...formData, assetName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Serial Number</Label>
                    <Input
                      placeholder="e.g., ABC123XYZ"
                      value={formData.serialNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, serialNumber: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) =>
                        setFormData({ ...formData, category: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="it">IT Assets</SelectItem>
                        <SelectItem value="projection">Projection</SelectItem>
                        <SelectItem value="consumables">Consumables</SelectItem>
                        <SelectItem value="spares">Spares / Parts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Asset Type</Label>
                    <Select
                      value={formData.assetTypeId}
                      onValueChange={(v) =>
                        setFormData({ ...formData, assetTypeId: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {assetTypes.map((type) => (
                          <SelectItem key={type.id} value={String(type.id)}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Search Asset</Label>
                  <Select
                    value={selectedAsset}
                    onValueChange={setSelectedAsset}
                    disabled={loadingLookups}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingLookups ? "Loading assets..." : "Select an asset"} />
                    </SelectTrigger>
                    <SelectContent>
                      {assets
                        .filter(
                          (a) =>
                            a.status === "available" ||
                            a.status === "assigned" ||
                            requestType === "dispose" ||
                            requestType === "buyback"
                        )
                        .map((asset) => (
                          <SelectItem key={asset.id} value={String(asset.id)}>
                            {asset.name} ({asset.serial_number || "No SN"})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedAssetData && (
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">{selectedAssetData.name}</h4>
                    <div className="mt-2 grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Serial Number</span>
                        <span>{selectedAssetData.serial_number || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category</span>
                        <Badge variant="outline" className="capitalize">
                          {selectedAssetData.asset_type_name}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant="outline" className="capitalize">
                          {selectedAssetData.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={
                  requestType === "create"
                    ? !formData.assetName || !formData.category
                    : !selectedAsset
                }
              >
                Continue
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Request Details */}
      {step === 3 && (
        <Card className="mx-auto w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>
              Provide the details for your request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(requestType === "transfer" || requestType === "assign") && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>To Location</Label>
                  <Select
                    value={formData.toLocationId}
                    onValueChange={(v) =>
                      setFormData({ ...formData, toLocationId: v })
                    }
                    disabled={loadingLookups}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={String(loc.id)}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>To Department</Label>
                  <Select
                    value={formData.toDepartmentId}
                    onValueChange={(v) =>
                      setFormData({ ...formData, toDepartmentId: v })
                    }
                    disabled={loadingLookups}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments
                        .filter(
                          (d) =>
                            !formData.toLocationId ||
                            d.location_id === Number(formData.toLocationId)
                        )
                        .map((dept) => (
                          <SelectItem key={dept.id} value={String(dept.id)}>
                            {dept.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {requestType === "assign" && (
              <div className="space-y-2">
                <Label>Assign To User</Label>
                <Select
                  value={formData.toUserId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, toUserId: v })
                  }
                  disabled={loadingLookups}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => {
                      const name = user.username;
                      return (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {name} {user.email ? `(${user.email})` : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>
                Reason <span className="text-red-400">*</span>
              </Label>
              <Input
                placeholder="Brief reason for this request"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Justification</Label>
              <Textarea
                placeholder="Provide detailed justification for approval..."
                value={formData.justification}
                onChange={(e) =>
                  setFormData({ ...formData, justification: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) =>
                  setFormData({ ...formData, priority: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Supporting Documents</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" type="button">
                  <Upload className="mr-2 size-4" />
                  Upload Files
                </Button>
                <span className="text-sm text-muted-foreground">
                  PDF, images, or documents
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={!formData.reason}>
                Continue
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <Card className="mx-auto w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Review & Submit</CardTitle>
            <CardDescription>
              Review your request before submitting for approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Request Summary */}
            <div className="rounded-lg border p-4">
              <h4 className="font-medium">Request Summary</h4>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Request Type</span>
                  <Badge variant="outline" className="capitalize">
                    {requestType}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asset</span>
                  <span>
                    {requestType === "create"
                      ? formData.assetName
                      : selectedAssetData?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority</span>
                  <Badge
                    variant="outline"
                    className={`capitalize ${
                      formData.priority === "urgent"
                        ? "border-red-500/50 text-red-400"
                        : formData.priority === "high"
                          ? "border-amber-500/50 text-amber-400"
                          : ""
                    }`}
                  >
                    {formData.priority}
                  </Badge>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Reason</span>
                  <span className="mt-1">{formData.reason}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Button>
              <Button onClick={handleSubmit}>Submit Request</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function NewRequestPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Requests", href: "/requests" },
          { label: "New Request" },
        ]}
      />
      <Suspense fallback={<div className="p-6">Loading...</div>}>
        <NewRequestForm />
      </Suspense>
    </>
  );
}
