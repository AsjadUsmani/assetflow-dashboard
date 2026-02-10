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
  // Use ApiService to call backend; ACL is enforced server-side
  const json = await apiService.get<WorkspaceMenuGroup[]>("/workspace/menus", true)
  return json.data ?? []
}

