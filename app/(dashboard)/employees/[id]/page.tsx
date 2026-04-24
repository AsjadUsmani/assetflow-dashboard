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
import { apiService } from "@/lib/services/api-service"
import { useToast } from "@/components/ui/use-toast"
import { getDepartments, type Department } from "@/lib/services/departments"
import {
  getWorkspaceRoles,
  getWorkspaceUserMeta,
  type CountryOption,
  type UserOfficeOption,
} from "@/lib/services/workspace-users"

type Role = { id: number; name: string }

type Employee = {
  id: number
  username: string
  email: string | null
  role_id: number
  role_name: string | null
  department_id: number | null
  department_name: string | null
  country_id: number | null
  country_name: string | null
  city: string | null
  title: string | null
  designation_id: number | null
  designation_name: string | null
  office: "INDIA_HO" | "TRADITIONAL" | "VIP" | "INDIA_RO" | null
  is_active: boolean
  last_login: string | null
  created_at?: string
  updated_at?: string
}

export default function EmployeeDetailsPage() {
  const params = useParams<{ id: string }>()
  const { toast } = useToast()
  const id = Number(params?.id)

  const [isLoading, setIsLoading] = React.useState(true)
  const [employee, setEmployee] = React.useState<Employee | null>(null)
  const [roles, setRoles] = React.useState<Role[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [countryOptions, setCountryOptions] = React.useState<CountryOption[]>([])
  const [officeOptions, setOfficeOptions] = React.useState<UserOfficeOption[]>([])

  React.useEffect(() => {
    if (!id || Number.isNaN(id)) return
    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      try {
        const [userRes, rolesRes, depts, meta] = await Promise.all([
          apiService.get<Employee>(`/workspace/users/${id}`),
          getWorkspaceRoles(),
          getDepartments(),
          getWorkspaceUserMeta(),
        ])

        if (controller.signal.aborted) return

        setEmployee(userRes.data ?? null)
        setRoles(rolesRes)
        setDepartments(depts)
        setCountryOptions(meta.country_options ?? [])
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

  const roleName =
    employee?.role_name ?? roles.find((role) => role.id === employee?.role_id)?.name ?? "-"

  const selectedDepartment = departments.find((department) => department.id === employee?.department_id)
  const departmentName = selectedDepartment
    ? selectedDepartment.location_name
      ? `${selectedDepartment.location_name} - ${selectedDepartment.name}`
      : selectedDepartment.name
    : employee?.department_name ?? "-"

  const countryName =
    employee?.country_name ?? countryOptions.find((country) => country.id === employee?.country_id)?.name ?? "-"

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
                Read-only view of the current employee profile.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Employee details</CardTitle>
              <CardDescription>
                Profile information is shown here in read-only mode.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Display name</Label>
                  <Input value={employee.username} readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email address</Label>
                  <Input value={employee.email ?? ""} readOnly disabled />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={roleName} readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value={departmentName} readOnly disabled />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Designation</Label>
                  <Input value={employee.designation_name ?? employee.title ?? ""} readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={employee.city ?? ""} readOnly disabled />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Country or Region</Label>
                  <Input value={countryName} readOnly disabled />
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
                <div className="space-y-2">
                  <Label>Last Login</Label>
                  <Input
                    value={employee.last_login ? new Date(employee.last_login).toLocaleString() : "Never"}
                    readOnly
                    disabled
                  />
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
