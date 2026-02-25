import { apiService } from "./api-service"

export type WorkspaceUser = {
  id: number
  username: string
  email: string | null
  first_name: string | null
  last_name: string | null
  role_name: string | null
  is_active: boolean
  last_login: string | null
}

export async function getWorkspaceUsers(): Promise<WorkspaceUser[]> {
  const json = await apiService.get<WorkspaceUser[]>("/workspace/users", true)
  return json.data ?? []
}
