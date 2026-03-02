"use client";

import Link from "next/link";
import { ArrowLeft, UserCheck } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewAssignmentPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Asset Management", href: "/assets" },
          { label: "Assignments", href: "/assignments" },
          { label: "New Assignment" },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/assignments">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                New Assignment
              </h1>
              <p className="text-sm text-muted-foreground">
                Please use the unified Requests flow (type &quot;assign&quot;) to
                create new assignments. This legacy page no longer uses mock
                data and is kept only as a placeholder.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="size-5" />
                Assignment creation moved
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                The old assignment screen relied on mocked assets and users.
                All mock data has been removed. To create a real assignment,
                go to <code>/requests/new</code> and choose the{" "}
                <strong>Assign Asset</strong> request type.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

