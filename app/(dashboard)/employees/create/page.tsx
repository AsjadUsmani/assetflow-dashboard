"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Search } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { apiService } from "@/lib/services/api-service"
import { useToast } from "@/components/ui/use-toast"
import { getDepartments, type Department } from "@/lib/services/departments"
import {
  getWorkspaceUserMeta,
  type CountryOption,
  type UserOfficeOption,
} from "@/lib/services/workspace-users"

export default function AddEmployeePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [officeOptions, setOfficeOptions] = React.useState<UserOfficeOption[]>([])
  const [countryOptions, setCountryOptions] = React.useState<CountryOption[]>([])
  const [designationOptions, setDesignationOptions] = React.useState<Array<{ id: number; name: string }>>([])

  const [username, setUsername] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [departmentId, setDepartmentId] = React.useState("")
  const [departmentPopoverOpen, setDepartmentPopoverOpen] = React.useState(false)
  const [city, setCity] = React.useState("")
  const [designationId, setDesignationId] = React.useState("")
  const [office, setOffice] = React.useState("")
  const [countryId, setCountryId] = React.useState("")
  const [isActive, setIsActive] = React.useState(true)

  const hasValidEmail = /^\S+@\S+\.\S+$/.test(email.trim())
  const canSubmit =
    !isLoading &&
    Boolean(username.trim()) &&
    hasValidEmail &&
    Boolean(office) &&
    Boolean(countryId)

  const selectedDepartment = departments.find((d) => String(d.id) === departmentId)

  React.useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const [depts, meta] = await Promise.all([
          getDepartments(),
          getWorkspaceUserMeta(),
        ])

        if (controller.signal.aborted) return

        setDepartments(depts)
        setOfficeOptions(meta.office_options ?? [])
        setCountryOptions(meta.country_options ?? [])
        setDesignationOptions(meta.designation_options ?? [])

        const india = meta.country_options?.find((c) => c.name.toLowerCase() === "india")
        if (india && !controller.signal.aborted) {
          setCountryId(String(india.id))
        } else if (meta.country_options?.[0] && !controller.signal.aborted) {
          setCountryId(String(meta.country_options[0].id))
        }
      } catch {
        if (controller.signal.aborted) return

        setDepartments([])
        setOfficeOptions([])
        setCountryOptions([])
        setDesignationOptions([])
      }
    }

    void load()
    return () => controller.abort()
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    setIsLoading(true)
    try {
      await apiService.post("/workspace/employees", {
        display_name: username.trim(),
        email: email.trim() || null,
        department_id: Number(departmentId) || null,
        country_id: Number(countryId) || null,
        city: city.trim() || null,
        designation_id: designationId ? Number(designationId) : null,
        office,
        is_active: isActive,
      })

      toast({
        title: "Employee created",
        description: "The employee directory record has been added.",
      })
      router.push("/employees")
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to add employee",
        description: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Employee", href: "/employees" },
          { label: "Add Employee" },
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
              <h1 className="text-2xl font-semibold tracking-tight">Add Employee</h1>
              <p className="text-muted-foreground">
                Create a directory employee record (no dashboard login). Fields map to the employee table.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit}>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Employee details</CardTitle>
                  <CardDescription>
                    Display name is stored as display_name; first and last name are derived when saving if needed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username">Display name *</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Popover open={departmentPopoverOpen} onOpenChange={setDepartmentPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start gap-2 font-normal">
                            <Search className="size-4" />
                            {selectedDepartment
                              ? selectedDepartment.location_name
                                ? `${selectedDepartment.location_name} - ${selectedDepartment.name}`
                                : selectedDepartment.name
                              : "Search or select department"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-75 p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search departments by name..." />
                            <CommandList>
                              <CommandEmpty>No departments found.</CommandEmpty>
                              <CommandGroup>
                                {departments.map((department) => (
                                  <CommandItem
                                    key={department.id}
                                    value={department.location_name
                                      ? `${department.location_name} ${department.name}`
                                      : department.name}
                                    onSelect={() => {
                                      setDepartmentId(String(department.id))
                                      setDepartmentPopoverOpen(false)
                                    }}
                                  >
                                    {department.location_name
                                      ? `${department.location_name} - ${department.name}`
                                      : department.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation</Label>
                      <Select value={designationId} onValueChange={setDesignationId}>
                        <SelectTrigger id="designation">
                          <SelectValue placeholder="Select designation" />
                        </SelectTrigger>
                        <SelectContent>
                          {designationOptions.map((designation) => (
                            <SelectItem key={designation.id} value={String(designation.id)}>
                              {designation.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country or Region *</Label>
                      <Select value={countryId} onValueChange={setCountryId}>
                        <SelectTrigger id="country">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countryOptions.map((country) => (
                            <SelectItem key={country.id} value={String(country.id)}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="office">Office *</Label>
                      <Select value={office} onValueChange={setOffice}>
                        <SelectTrigger id="office">
                          <SelectValue placeholder="Select office" />
                        </SelectTrigger>
                        <SelectContent>
                          {officeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="isActive">Status</Label>
                      <Select
                        value={isActive ? "active" : "inactive"}
                        onValueChange={(value) => setIsActive(value === "active")}
                      >
                        <SelectTrigger id="isActive">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/employees")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!canSubmit}>
                  {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Add Employee
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
