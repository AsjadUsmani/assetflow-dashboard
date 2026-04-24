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
  getWorkspaceRoles,
  getWorkspaceUserMeta,
  type UserOfficeOption,
} from "@/lib/services/workspace-users"

type Role = { id: number; name: string }
const HARDCODED_COUNTRY_NAME = "India"

export default function AddUserPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)
  const [roles, setRoles] = React.useState<Role[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [officeOptions, setOfficeOptions] = React.useState<UserOfficeOption[]>([])

  const [username, setUsername] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [roleId, setRoleId] = React.useState("")
  const [rolePopoverOpen, setRolePopoverOpen] = React.useState(false)
  const [departmentId, setDepartmentId] = React.useState("")
  const [departmentPopoverOpen, setDepartmentPopoverOpen] = React.useState(false)
  const [city, setCity] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [office, setOffice] = React.useState("")
  const [isActive, setIsActive] = React.useState(true)

  const hasValidEmail = /^\S+@\S+\.\S+$/.test(email.trim())
  const hasMinPasswordLength = password.trim().length >= 8
  const canSubmit =
    !isLoading &&
    Boolean(username.trim()) &&
    hasValidEmail &&
    hasMinPasswordLength &&
    Boolean(roleId) &&
    Boolean(office)

  const selectedRole = roles.find((r) => String(r.id) === roleId)
  const selectedDepartment = departments.find((d) => String(d.id) === departmentId)

  React.useEffect(() => {
  const controller = new AbortController()

  async function load() {
    try {
      const [roles, depts, meta] = await Promise.all([
        getWorkspaceRoles(),
        getDepartments(),
        getWorkspaceUserMeta(),
      ])

      if (controller.signal.aborted) return

      setRoles(roles)
      setDepartments(depts)
      setOfficeOptions(meta.office_options ?? [])
    } catch {
      if (controller.signal.aborted) return

      setRoles([])
      setDepartments([])
      setOfficeOptions([])
    }
  }

    void load()
    return () => controller.abort()
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    setIsLoading(true)
    try {
      await apiService.post("/workspace/users", {
        username: username.trim(),
        email: email.trim() || null,
        password: password.trim(),
        role_id: Number(roleId),
        department_id: Number(departmentId) || null,
        country_name: HARDCODED_COUNTRY_NAME,
        city: city.trim() || null,
        title: title.trim() || null,
        office,
        is_active: isActive,
      })

      toast({
        title: "User created",
        description: "The user has been added.",
      })
      router.push("/users")
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to add user",
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
          { label: "Users", href: "/users" },
          { label: "Add User" },
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
              <h1 className="text-2xl font-semibold tracking-tight">Add User</h1>
              <p className="text-muted-foreground">
                Create a user with display name, title, department, office and status.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit}>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User details</CardTitle>
                  <CardDescription>
                    Capture the profile fields that are stored on the user record.
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
                      <Label htmlFor="role">Role *</Label>
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
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country or Region *</Label>
                      <Input id="country" value={HARDCODED_COUNTRY_NAME} disabled readOnly />
                    </div>
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
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
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
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!canSubmit}>
                  {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Add User
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}