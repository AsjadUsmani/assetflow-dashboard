"use client";

import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExpiryReportPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Reports", href: "/reports" },
          { label: "Expiry Report" },
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
              Expiry Report
            </h1>
            <p className="text-muted-foreground">
              Warranty and license expiry analytics will be added once backend
              support is in place.
            </p>
          </div>
        </div>

        <Card className="bg-card border-border max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-warning" />
              Expiry analytics coming soon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              The previous version of this page used mocked asset data to
              simulate upcoming expiries. That mock data has been removed.
            </p>
            <p>
              Real expiry information will be computed from asset fields like
              warranty and license dates once reporting endpoints are
              implemented.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

