import { apiService } from "./api-service"

export type WorkspaceUser = {
  id: number
  username: string
  email: string | null
  role_name: string | null
  department_name: string | null
  country_id: number | null
  country_name: string | null
  city: string | null
  office: "INDIA_HO" | "TRADITIONAL" | "VIP" | "INDIA_RO" | null
  is_active: boolean
  last_login: string | null
}

export type UserOfficeOption = {
  value: "INDIA_HO" | "TRADITIONAL" | "VIP" | "INDIA_RO"
  label: string
}

export type CountryOption = {
  id: number
  name: string
}

export type WorkspaceUserMeta = {
  office_options: UserOfficeOption[]
  country_options: CountryOption[]
}

export type Role = {
  id: number
  name: string
}

export async function getWorkspaceUsers(): Promise<WorkspaceUser[]> {
  const json = await apiService.get<WorkspaceUser[]>("/workspace/users", true)
  return json.data ?? []
}

export async function getWorkspaceUserMeta(): Promise<WorkspaceUserMeta> {
  const json = await apiService.get<WorkspaceUserMeta>("/workspace/users/meta", true)
  return json.data ?? { office_options: [], country_options: [] }
}

export async function getWorkspaceRoles(): Promise<Role[]> {
  const json = await apiService.get<Role[]>("/workspace/roles", true)
  return json.data ?? []
}
