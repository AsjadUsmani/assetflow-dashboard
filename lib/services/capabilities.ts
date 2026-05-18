import { apiService } from "./api-service"
import { getWorkspaceMenus, type WorkspaceMenuGroup } from "./menu"

export type RoleCapabilities = {
  can_create: boolean
  can_update: boolean
  can_delete: boolean
}

let cachedCapabilities: RoleCapabilities | null = null

export async function loadWorkspaceMenusAndCapabilities(): Promise<{
  groups: WorkspaceMenuGroup[]
  capabilities: RoleCapabilities
}> {
  const json = await apiService.get<{
    groups: WorkspaceMenuGroup[]
    capabilities: RoleCapabilities
  }>("/workspace/menus", true)

  const groups = json.data?.groups ?? []
  const capabilities = json.data?.capabilities ?? {
    can_create: false,
    can_update: true,
    can_delete: true,
  }
  cachedCapabilities = capabilities
  return { groups, capabilities }
}

export async function getWorkspaceCapabilities(): Promise<RoleCapabilities> {
  if (cachedCapabilities) return cachedCapabilities
  const { capabilities } = await loadWorkspaceMenusAndCapabilities()
  return capabilities
}

export function getCachedCapabilities(): RoleCapabilities | null {
  return cachedCapabilities
}

/** @deprecated Use loadWorkspaceMenusAndCapabilities */
export { getWorkspaceMenus }
