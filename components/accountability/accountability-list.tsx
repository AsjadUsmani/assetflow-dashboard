"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export function AccountabilityList() {
  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-warning" />
            Accountability Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Detailed accountability reporting (per-user asset assignments, gaps,
            and overdue returns) will appear here once the backend exposes the
            necessary assignment data.
          </p>
          <p>
            Core assignment and movement flows are already handled through the
            asset request system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
