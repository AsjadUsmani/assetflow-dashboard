import { apiService } from "./api-service"

export type WorkspaceMenu = {
  id: number
  path: string
  label: string | null
  icon: string | null
  sort_order: number
  children: WorkspaceMenu[]
}

export type WorkspaceMenuGroup = {
  id: number
  name: string
  description: string | null
  sort_order: number
  menus: WorkspaceMenu[]
}

export async function getWorkspaceMenus(): Promise<WorkspaceMenuGroup[]> {
  const json = await apiService.get<{
    groups: WorkspaceMenuGroup[]
    capabilities?: { can_create: boolean; can_update: boolean; can_delete: boolean }
  }>("/workspace/menus", true)
  if (Array.isArray(json.data)) {
    return json.data
  }
  return json.data?.groups ?? []
}

