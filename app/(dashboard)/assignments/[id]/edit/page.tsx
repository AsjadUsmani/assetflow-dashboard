"use client";

import Link from "next/link";
import { ArrowLeft, UserCheck } from "lucide-react";
import { useParams } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditAssignmentPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Asset Management", href: "/assets" },
          { label: "Assignments", href: "/assignments" },
          { label: `Assignment ${id}`, href: `/assignments/${id}` },
          { label: "Edit" },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/assignments/${id}`}>
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Edit Assignment
              </h1>
              <p className="text-sm text-muted-foreground">
                Editing of legacy assignments has been disabled while we move to
                the unified request-based workflow. No mock data is used here
                anymore.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="size-5" />
                Assignment editing unavailable
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                To change who an asset is assigned to, create a new{" "}
                <strong>Assign</strong> request in the Requests module instead
                of editing this legacy record.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

