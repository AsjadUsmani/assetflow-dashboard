"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserCheck } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { users } from "@/lib/mock-data";

const assignments = [
  {
    id: "asgn-1",
    assetId: "ast-001",
    assetName: "MacBook Pro 16\"",
    userId: "usr-002",
    userName: "Jane Smith",
    assignedDate: "2025-01-15",
    status: "active",
    notes: "Primary work laptop for development tasks",
  },
];

export default function EditAssignmentPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const assignment = assignments.find((a) => a.id === id) || assignments[0];
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push(`/assignments/${id}`);
  };

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Asset Management", href: "/assets" },
          { label: "Assignments", href: "/assignments" },
          { label: assignment.assetName, href: `/assignments/${id}` },
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
                Update assignment details
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <UserCheck className="size-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Assignment Details</CardTitle>
                    <CardDescription>
                      Update the assignment information
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="asset">Asset</Label>
                  <Input
                    id="asset"
                    value={assignment.assetName}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Asset cannot be changed. Create a new assignment instead.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user">Assigned To *</Label>
                  <Select defaultValue={assignment.userId} required>
                    <SelectTrigger id="user">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} - {user.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Assignment Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    defaultValue={assignment.assignedDate}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedReturn">Expected Return Date</Label>
                  <Input id="expectedReturn" type="date" />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for permanent assignments
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    defaultValue={assignment.notes}
                    placeholder="Additional notes about this assignment..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" type="button" asChild>
                    <Link href={`/assignments/${id}`}>Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </main>
    </>
  );
}
