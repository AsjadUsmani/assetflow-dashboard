"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

export default function AddUserPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)
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
    const controller = new AbortController()
    async function load() {
      try {
        const res = await apiService.get<Role[]>("/workspace/roles")
        if (!controller.signal.aborted && res.data) setRoles(res.data)
      } catch {
        if (!controller.signal.aborted) setRoles([])
      }
    }
    void load()
    return () => controller.abort()
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) {
      toast({
        variant: "destructive",
        title: "Username is required",
      })
      return
    }
    if (!password.trim()) {
      toast({
        variant: "destructive",
        title: "Password is required",
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

    setIsLoading(true)
    try {
      await apiService.post("/workspace/users", {
        username: username.trim(),
        email: email.trim() || null,
        mobile: mobile.trim() || null,
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        password: password.trim(),
        role_id: Number(roleId),
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
              <h1 className="text-2xl font-semibold tracking-tight">
                Add User
              </h1>
              <p className="text-muted-foreground">
                Create a new user with username, password and role.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit}>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User details</CardTitle>
                  <CardDescription>
                    Username, password, contact info and role.
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
                      <Label htmlFor="password">
                        Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile</Label>
                      <Input
                        id="mobile"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
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
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
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
