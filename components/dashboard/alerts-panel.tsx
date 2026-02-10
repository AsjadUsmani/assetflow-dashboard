"use client";

import { AlertCircle, UserX, Package, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const alerts = [
  {
    id: "1",
    type: "gap" as const,
    title: "Accountability Gap",
    description: "8 assets have no assigned owner",
    icon: UserX,
    actionLabel: "Review assets",
  },
  {
    id: "2",
    type: "untracked" as const,
    title: "Untracked Assets",
    description: "3 recently added assets need categorization",
    icon: Package,
    actionLabel: "Categorize now",
  },
  {
    id: "3",
    type: "maintenance" as const,
    title: "Maintenance Due",
    description: "12 assets require scheduled maintenance",
    icon: AlertCircle,
    actionLabel: "View schedule",
  },
];

const alertTypeConfig = {
  gap: {
    bgColor: "bg-destructive/10",
    iconColor: "text-destructive",
    borderColor: "border-destructive/20",
  },
  untracked: {
    bgColor: "bg-warning/10",
    iconColor: "text-warning",
    borderColor: "border-warning/20",
  },
  maintenance: {
    bgColor: "bg-primary/10",
    iconColor: "text-primary",
    borderColor: "border-primary/20",
  },
};

export function AlertsPanel() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <AlertCircle className="size-4 text-destructive" />
          Action Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const config = alertTypeConfig[alert.type];
          const Icon = alert.icon;

          return (
            <div
              key={alert.id}
              className={`group flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-accent ${config.bgColor} ${config.borderColor}`}
            >
              <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${config.bgColor}`}>
                <Icon className={`size-4 ${config.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {alert.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {alert.description}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-primary mt-1"
                >
                  {alert.actionLabel}
                  <ChevronRight className="ml-1 size-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
