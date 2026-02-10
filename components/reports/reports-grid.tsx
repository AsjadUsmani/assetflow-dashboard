"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Package,
  MapPin,
  AlertTriangle,
  Clock,
  DollarSign,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const reportCategories = [
  {
    title: "Asset Inventory",
    description: "Complete asset register and inventory reports",
    icon: Package,
    color: "text-primary",
    bgColor: "bg-primary/10",
    reports: [
      {
        name: "Full Asset Register",
        description: "Complete list of all assets with details",
        format: "xlsx",
      },
      {
        name: "Asset Summary by Category",
        description: "Assets grouped by type and category",
        format: "pdf",
      },
      {
        name: "Asset Valuation Report",
        description: "Current value and depreciation status",
        format: "xlsx",
      },
    ],
  },
  {
    title: "Location Reports",
    description: "Asset distribution across locations",
    icon: MapPin,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    reports: [
      {
        name: "Assets by Location",
        description: "Asset count and value per location",
        format: "pdf",
      },
      {
        name: "Location Utilization",
        description: "Space and asset utilization metrics",
        format: "xlsx",
      },
      {
        name: "Cross-Location Comparison",
        description: "Compare assets across locations",
        format: "pdf",
      },
    ],
  },
  {
    title: "User Accountability",
    description: "Asset assignments and user reports",
    icon: Users,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    reports: [
      {
        name: "User Assignment Report",
        description: "All assets assigned to users",
        format: "xlsx",
      },
      {
        name: "Department Allocation",
        description: "Assets allocated per department",
        format: "pdf",
      },
      {
        name: "Accountability Matrix",
        description: "User responsibility mapping",
        format: "pdf",
      },
    ],
  },
  {
    title: "Movement History",
    description: "Asset transfers and movement logs",
    icon: TrendingUp,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    reports: [
      {
        name: "Movement Log",
        description: "Complete transfer history",
        format: "xlsx",
      },
      {
        name: "Pending Approvals",
        description: "Movements awaiting approval",
        format: "pdf",
      },
      {
        name: "Movement Analytics",
        description: "Transfer patterns and trends",
        format: "pdf",
      },
    ],
  },
  {
    title: "Expiry & Maintenance",
    description: "Warranty, license, and maintenance reports",
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10",
    reports: [
      {
        name: "Expiring Warranties",
        description: "Assets with warranties expiring soon",
        format: "xlsx",
      },
      {
        name: "License Expiry Report",
        description: "Software licenses status",
        format: "pdf",
      },
      {
        name: "Maintenance Schedule",
        description: "Upcoming maintenance tasks",
        format: "xlsx",
      },
    ],
  },
  {
    title: "Financial Reports",
    description: "Cost, depreciation, and budget reports",
    icon: DollarSign,
    color: "text-success",
    bgColor: "bg-success/10",
    reports: [
      {
        name: "Asset Cost Analysis",
        description: "Total cost of ownership breakdown",
        format: "xlsx",
      },
      {
        name: "Depreciation Report",
        description: "Asset depreciation schedules",
        format: "pdf",
      },
      {
        name: "Budget vs Actual",
        description: "Asset spending analysis",
        format: "xlsx",
      },
    ],
  },
];

export function ReportsGrid() {
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{
    category: string;
    report: { name: string; description: string; format: string };
  } | null>(null);

  const handleGenerateReport = (
    category: string,
    report: { name: string; description: string; format: string }
  ) => {
    setSelectedReport({ category, report });
    setGenerateDialogOpen(true);
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.title} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.bgColor}`}>
                    <Icon className={`size-5 ${category.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{category.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.reports.map((report) => (
                  <div
                    key={report.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium truncate">
                          {report.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 uppercase"
                        >
                          {report.format}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 pl-6">
                        {report.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 ml-2"
                      onClick={() =>
                        handleGenerateReport(category.title, report)
                      }
                    >
                      <Download className="size-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Scheduled Reports Section */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="size-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Scheduled Reports</CardTitle>
                <CardDescription className="text-xs">
                  Automated reports sent to your email
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 size-4" />
              Schedule New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <BarChart3 className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Weekly Asset Summary</p>
                  <p className="text-xs text-muted-foreground">
                    Every Monday at 9:00 AM
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <PieChart className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Monthly Depreciation Report</p>
                  <p className="text-xs text-muted-foreground">
                    1st of every month
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <AlertTriangle className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Expiry Alert Report</p>
                  <p className="text-xs text-muted-foreground">
                    Daily at 8:00 AM
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Report Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>
              Configure and download {selectedReport?.report.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" />
                <Input type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location Filter</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="hq">Headquarters</SelectItem>
                  <SelectItem value="branch1">Branch Office 1</SelectItem>
                  <SelectItem value="branch2">Branch Office 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select defaultValue={selectedReport?.report.format || "pdf"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV File</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="email-copy" />
              <Label htmlFor="email-copy" className="text-sm font-normal">
                Send a copy to my email
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGenerateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setGenerateDialogOpen(false)}>
              <Download className="mr-2 size-4" />
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
