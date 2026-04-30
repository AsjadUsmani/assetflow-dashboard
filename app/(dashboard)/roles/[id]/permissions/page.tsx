"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Shield } from "lucide-react"

import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { apiService } from "@/lib/services/api-service"
import { useToast } from "@/components/ui/use-toast"

type PermissionItem = {
  menu_id: number
  menu_label: string
  menu_path: string
  group_name: string
  is_allowed: boolean
  can_read: boolean
  can_create: boolean
  can_update: boolean
  can_delete: boolean
  is_active: boolean
}

export default function RolePermissionsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const roleId = Number(params?.id)

  const [roleName, setRoleName] = React.useState<string>("")
  const [permissions, setPermissions] = React.useState<PermissionItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    if (!roleId || Number.isNaN(roleId)) return
    const controller = new AbortController()

    async function load() {
      try {
        const [roleRes, permsRes] = await Promise.all([
          apiService.get<{ id: number; name: string }>(
            `/workspace/roles/${roleId}`,
          ),
          apiService.get<PermissionItem[]>(
            `/workspace/roles/${roleId}/permissions`,
          ),
        ])

        if (!controller.signal.aborted) {
          if (roleRes.data) {
            setRoleName(roleRes.data.name)
          }
          setPermissions(permsRes.data ?? [])
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          const message =
            err instanceof Error ? err.message : "Failed to load permissions"
          toast({
            variant: "destructive",
            title: "Failed to load permissions",
            description: message,
          })
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void load()
    return () => controller.abort()
  }, [roleId, toast])

  function updatePermission(
    menuId: number,
    field: keyof PermissionItem,
    value: boolean,
  ) {
    setPermissions((prev) =>
      prev.map((p) =>
        p.menu_id === menuId
          ? {
              ...p,
              [field]: value,
              ...(field === "is_allowed" && !value
                ? {
                    can_read: false,
                    can_create: false,
                    can_update: false,
                    can_delete: false,
                  }
                : {}),
            }
          : p,
      ),
    )
  }

  async function onSave() {
    if (!roleId || Number.isNaN(roleId)) return

    setIsSaving(true)
    try {
      await apiService.put(`/workspace/roles/${roleId}/permissions`, {
        items: permissions,
      })

      toast({
        title: "Permissions updated",
        description: "Role permissions have been saved.",
      })
      router.push("/roles")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update permissions"
      toast({
        variant: "destructive",
        title: "Failed to update permissions",
        description: message,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Roles", href: "/roles" },
          { label: "Permissions" },
        ]}
      />
      <div className="flex-1 p-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/roles">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <Shield className="size-5 text-primary" />
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Role Permissions
                </h1>
                <p className="text-sm text-muted-foreground">
                  Configure menu access and operations for{" "}
                  <span className="font-medium">{roleName || "Role"}</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Menu Group</TableHead>
                  <TableHead>Menu</TableHead>
                  <TableHead className="hidden md:table-cell">Path</TableHead>
                  <TableHead>Allowed</TableHead>
                  <TableHead>Read</TableHead>
                  <TableHead>Create</TableHead>
                  <TableHead>Update</TableHead>
                  <TableHead>Delete</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Loading permissions...
                    </TableCell>
                  </TableRow>
                ) : permissions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No menus available to configure.
                    </TableCell>
                  </TableRow>
                ) : (
                  permissions.map((p) => (
                    <TableRow key={p.menu_id}>
                      <TableCell>
                        <Badge variant="outline">{p.group_name}</Badge>
                      </TableCell>
                      <TableCell>{p.menu_label}</TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                        {p.menu_path}
                      </TableCell>
                       <TableCell>
                         <Switch
                           className="cursor-pointer"
                           checked={p.is_allowed}
                           onCheckedChange={(v) =>
                             updatePermission(p.menu_id, "is_allowed", v)
                           }
                         />
                      </TableCell>
                       <TableCell>
                         <Switch
                           className="cursor-pointer"
                           checked={p.can_read}
                           onCheckedChange={(v) =>
                             updatePermission(p.menu_id, "can_read", v)
                           }
                         />
                      </TableCell>
                       <TableCell>
                         <Switch
                           className="cursor-pointer"
                           checked={p.can_create}
                           onCheckedChange={(v) =>
                             updatePermission(p.menu_id, "can_create", v)
                           }
                         />
                      </TableCell>
                       <TableCell>
                         <Switch
                           className="cursor-pointer"
                           checked={p.can_update}
                           onCheckedChange={(v) =>
                             updatePermission(p.menu_id, "can_update", v)
                           }
                         />
                      </TableCell>
                       <TableCell>
                         <Switch
                           className="cursor-pointer"
                           checked={p.can_delete}
                           onCheckedChange={(v) =>
                             updatePermission(p.menu_id, "can_delete", v)
                           }
                         />
                      </TableCell>
                       <TableCell>
                         <Switch
                           className="cursor-pointer"
                           checked={p.is_active}
                           onCheckedChange={(v) =>
                             updatePermission(p.menu_id, "is_active", v)
                           }
                         />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/roles")}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={onSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
