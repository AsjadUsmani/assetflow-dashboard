"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"

import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  getWorkspaceUserMeta,
  type UserOfficeOption,
} from "@/lib/services/workspace-users"
import { getEmployeeById, type EmployeeDetail } from "@/lib/services/employees"

function primaryName(employee: EmployeeDetail): string {
  const fromDisplay = employee.display_name?.trim()
  if (fromDisplay) return fromDisplay
  return [employee.first_name, employee.last_name].filter(Boolean).join(" ").trim() || employee.first_name
}

export default function EmployeeDetailsPage() {
  const params = useParams<{ id: string }>()
  const { toast } = useToast()
  const id = Number(params?.id)

  const [isLoading, setIsLoading] = React.useState(true)
  const [employee, setEmployee] = React.useState<EmployeeDetail | null>(null)
  const [officeOptions, setOfficeOptions] = React.useState<UserOfficeOption[]>([])

  React.useEffect(() => {
    if (!id || Number.isNaN(id)) return
    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      try {
        const [row, meta] = await Promise.all([
          getEmployeeById(id),
          getWorkspaceUserMeta(),
        ])

        if (controller.signal.aborted) return

        setEmployee(row)
        setOfficeOptions(meta.office_options ?? [])
      } catch (err) {
        if (!controller.signal.aborted) {
          toast({
            variant: "destructive",
            title: "Failed to load employee details",
            description: err instanceof Error ? err.message : "Unknown error",
          })
          window.location.href = "/employees"
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void load()
    return () => controller.abort()
  }, [id, toast])

  const officeLabel =
    officeOptions.find((option) => option.value === employee?.office)?.label ??
    employee?.office ??
    "-"

  if (isLoading) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Employee", href: "/employees" },
            { label: "Details" },
          ]}
        />
        <div className="flex flex-1 items-center justify-center p-6">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  if (!employee) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Employee", href: "/employees" },
            { label: "Details" },
          ]}
        />
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Employee not found.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Employee", href: "/employees" },
          { label: "Details" },
        ]}
      />
      <div className="flex-1 p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/employees">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Employee Details</h1>
              <p className="text-muted-foreground">
                Directory record (no login). Profile fields match the employee table.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Employee details</CardTitle>
              <CardDescription>
                HR directory fields from the database, read-only in this view.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Display name</Label>
                  <Input value={primaryName(employee)} readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email address</Label>
                  <Input value={employee.email ?? ""} readOnly disabled />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>First name</Label>
                  <Input value={employee.first_name} readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label>Last name</Label>
                  <Input value={employee.last_name ?? ""} readOnly disabled />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mobile</Label>
                  <Input value={employee.mobile ?? ""} readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label>Designation</Label>
                  <Input value={employee.designation_name ?? ""} readOnly disabled />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value={employee.department_name ?? ""} readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={employee.city ?? ""} readOnly disabled />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Country or Region</Label>
                  <Input value={employee.country_name ?? ""} readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label>Office</Label>
                  <Input value={officeLabel} readOnly disabled />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div>
                    <Badge variant={employee.is_active ? "default" : "secondary"}>
                      {employee.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Created At</Label>
                  <Input
                    value={employee.created_at ? new Date(employee.created_at).toLocaleString() : "-"}
                    readOnly
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Updated At</Label>
                  <Input
                    value={employee.updated_at ? new Date(employee.updated_at).toLocaleString() : "-"}
                    readOnly
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
