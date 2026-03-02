"use client";

import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InventoryReportPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Reports", href: "/reports" },
          { label: "Inventory Report" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/reports">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Inventory Report
            </h1>
            <p className="text-muted-foreground">
              This report will provide backend-driven inventory analytics once
              reporting APIs are available.
            </p>
          </div>
        </div>

        <Card className="bg-card border-border max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-5" />
              Inventory analytics coming soon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              The previous version of this page showed mock inventory numbers.
              Those have been removed so that only real backend data is used in
              the dashboard.
            </p>
            <p>
              You can already view live asset data from the backend on the main
              Assets list and dashboard widgets.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

