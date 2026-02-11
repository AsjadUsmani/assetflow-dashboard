"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { apiService } from "@/lib/services/api-service"
import { useToast } from "@/components/ui/use-toast"

type Role = { id: number; name: string }
type User = {
  id: number
  username: string
  email: string | null
  mobile: string | null
  first_name: string | null
  last_name: string | null
  role_id: number
  role_name: string | null
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
  const [username, setUsername] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [mobile, setMobile] = React.useState("")
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [roleId, setRoleId] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isActive, setIsActive] = React.useState(true)

  React.useEffect(() => {
    if (!id || Number.isNaN(id)) return
    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      try {
        const [userRes, rolesRes] = await Promise.all([
          apiService.get<User>(`/workspace/users/${id}`),
          apiService.get<Role[]>("/workspace/roles"),
        ])
        if (controller.signal.aborted) return
        if (userRes.data) {
          const u = userRes.data
          setUsername(u.username)
          setEmail(u.email ?? "")
          setMobile(u.mobile ?? "")
          setFirstName(u.first_name ?? "")
          setLastName(u.last_name ?? "")
          setRoleId(String(u.role_id))
          setIsActive(u.is_active)
        }
        if (rolesRes.data) setRoles(rolesRes.data)
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
      toast({
        variant: "destructive",
        title: "Username is required",
      })
      return
    }
    if (!roleId) {
      toast({
        variant: "destructive",
        title: "Role is required",
      })
      return
    }

    setIsSaving(true)
    try {
      const payload: Record<string, unknown> = {
        username: username.trim(),
        email: email.trim() || null,
        mobile: mobile.trim() || null,
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        role_id: Number(roleId),
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
      <DashboardHeader
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
              <h1 className="text-2xl font-semibold tracking-tight">
                Edit User
              </h1>
              <p className="text-muted-foreground">
                Update user details and role.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit}>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User details</CardTitle>
                  <CardDescription>
                    Username, contact info and role.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username">
                        Username <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
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
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input
                      id="mobile"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role <span className="text-destructive">*</span></Label>
                    <Select value={roleId} onValueChange={setRoleId}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => (
                          <SelectItem key={r.id} value={String(r.id)}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                    <Label htmlFor="isActive">Active</Label>
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
                  {isSaving && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
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
