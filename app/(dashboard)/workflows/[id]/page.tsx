"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, GitBranch } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkflowDetailPage() {
  const router = useRouter();

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Workflows", href: "/workflows" },
          { label: "Workflow Detail" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <Card className="bg-card border-border max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="size-5" />
              Workflow detail not available yet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              The rich multi-stage workflow detail view is currently based on
              mock workflow data and has been disabled.
            </p>
            <p>
              Core approvals are handled through the unified asset request flow.
              This page will be reconnected once backend workflow APIs are in
              place.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/workflows">Back to Workflows</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
