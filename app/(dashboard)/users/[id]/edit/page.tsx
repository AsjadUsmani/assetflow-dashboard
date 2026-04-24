"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
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
  type UserOfficeOption,
} from "@/lib/services/workspace-users"

type Role = { id: number; name: string }
const HARDCODED_COUNTRY_NAME = "India"

type User = {
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
}

export default function EditUserPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const id = Number(params?.id)

  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [roles, setRoles] = React.useState<Role[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [officeOptions, setOfficeOptions] = React.useState<UserOfficeOption[]>([])
  const [designationOptions, setDesignationOptions] = React.useState<Array<{ id: number; name: string }>>([])

  const [username, setUsername] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [roleId, setRoleId] = React.useState("")
  const [rolePopoverOpen, setRolePopoverOpen] = React.useState(false)
  const [departmentId, setDepartmentId] = React.useState("")
  const [departmentPopoverOpen, setDepartmentPopoverOpen] = React.useState(false)
  const [city, setCity] = React.useState("")
  const [designationId, setDesignationId] = React.useState("")
  const [office, setOffice] = React.useState("")
  const [isActive, setIsActive] = React.useState(true)

  const selectedRole = roles.find((r) => String(r.id) === roleId)
  const selectedDepartment = departments.find((d) => String(d.id) === departmentId)

  React.useEffect(() => {
    if (!id || Number.isNaN(id)) return
    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      try {
        const [userRes, rolesRes, depts, meta] = await Promise.all([
          apiService.get<User>(`/workspace/users/${id}`),
          apiService.get<Role[]>("/workspace/roles"),
          getDepartments(),
          getWorkspaceUserMeta(),
        ])
        if (controller.signal.aborted) return

        if (userRes.data) {
          const user = userRes.data
          setUsername(user.username)
          setEmail(user.email ?? "")
          setRoleId(String(user.role_id))
          setDepartmentId(user.department_id ? String(user.department_id) : "")
          setCity(user.city ?? "")
          setDesignationId(user.designation_id ? String(user.designation_id) : "")
          setOffice(user.office ?? "")
          setIsActive(user.is_active)
        }

        setRoles(rolesRes.data ?? [])
        setDepartments(depts)
        setOfficeOptions(meta.office_options ?? [])
        setDesignationOptions(meta.designation_options ?? [])
      } catch (err) {
        if (!controller.signal.aborted) {
          toast({
            variant: "destructive",
            title: "Failed to load user",
            description: err instanceof Error ? err.message : "Unknown error",
          })
          router.push("/users")
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void load()
    return () => controller.abort()
  }, [id, router, toast])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!username.trim()) {
      toast({ variant: "destructive", title: "Display name is required" })
      return
    }
    if (!roleId) {
      toast({ variant: "destructive", title: "Role is required" })
      return
    }
    if (!office) {
      toast({ variant: "destructive", title: "Office is required" })
      return
    }

    setIsSaving(true)
    try {
      const payload: Record<string, unknown> = {
        username: username.trim(),
        email: email.trim() || null,
        role_id: Number(roleId),
        department_id: departmentId ? Number(departmentId) : null,
        country_name: HARDCODED_COUNTRY_NAME,
        city: city.trim() || null,
        designation_id: designationId ? Number(designationId) : null,
        office,
        is_active: isActive,
      }
      if (password.trim()) payload.password = password.trim()

      await apiService.put(`/workspace/users/${id}`, payload)
      toast({
        title: "User updated",
        description: "Changes have been saved.",
      })
      router.push("/users")
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to update user",
        description: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Users", href: "/users" },
            { label: "Edit" },
          ]}
        />
        <div className="flex flex-1 items-center justify-center p-6">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Users", href: "/users" },
          { label: "Edit" },
        ]}
      />
      <div className="flex-1 p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/users">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Edit User</h1>
              <p className="text-muted-foreground">
                Update the user profile, title, department, office and block status.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit}>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User details</CardTitle>
                  <CardDescription>
                    Maintain the user record and login details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username">Display name</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
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
                      <Label htmlFor="role">Role</Label>
                      <Popover open={rolePopoverOpen} onOpenChange={setRolePopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start gap-2 font-normal">
                            <Search className="size-4" />
                            {selectedRole ? selectedRole.name : "Search or select role"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-75 p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search roles..." />
                            <CommandList>
                              <CommandEmpty>No roles found.</CommandEmpty>
                              <CommandGroup>
                                {roles.map((role) => (
                                  <CommandItem
                                    key={role.id}
                                    value={role.name}
                                    onSelect={() => {
                                      setRoleId(String(role.id))
                                      setRolePopoverOpen(false)
                                    }}
                                  >
                                    {role.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
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
                            <CommandInput placeholder="Search departments..." />
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
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
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
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country or Region</Label>
                      <Input id="country" value={HARDCODED_COUNTRY_NAME} disabled readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="office">Office</Label>
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
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="password">New password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Leave blank to keep current"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isActive">Block</Label>
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
                </CardContent>
              </Card>

              <div className="flex items-center justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/users")}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Save changes
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}