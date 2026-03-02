"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, Trash2, DollarSign } from "lucide-react";

export function WorkflowsList() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Workflow Requests
          </CardTitle>
          <Badge variant="secondary">0 total</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Workflow requests (transfer, disposal, buyback) will appear here once
          backend support for approval workflows is implemented.
        </p>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="flex items-center gap-1">
            <ArrowRightLeft className="size-3" /> Transfer
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Trash2 className="size-3" /> Disposal
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <DollarSign className="size-3" /> Buyback
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
