import { apiService } from "./api-service"

export type Organization = {
  id: number
  name: string
  industry: string | null
  status: string
  email: string | null
  phone: string | null
  website: string | null
  description: string | null
  created_at: string
  locations_count?: number
}

export type CreateOrganizationBody = {
  name: string
  industry?: string
  status?: string
  email?: string
  phone?: string
  website?: string
  description?: string
}

export type UpdateOrganizationBody = Partial<CreateOrganizationBody>

const BASE = "/workspace/organizations"

export async function getOrganizations(): Promise<Organization[]> {
  const json = await apiService.get<Organization[]>(BASE, true)
  return json.data ?? []
}

export async function getOrganizationById(id: number): Promise<Organization | null> {
  const json = await apiService.get<Organization>(`${BASE}/${id}`, true)
  return json.data ?? null
}

export async function createOrganization(body: CreateOrganizationBody): Promise<Organization> {
  const json = await apiService.post<Organization>(BASE, body, true)
  if (!json.data) throw new Error(json.message ?? "Failed to create organization")
  return json.data
}

export async function updateOrganization(
  id: number,
  body: UpdateOrganizationBody
): Promise<Organization> {
  const json = await apiService.put<Organization>(`${BASE}/${id}`, body, true)
  if (!json.data) throw new Error(json.message ?? "Failed to update organization")
  return json.data
}

export async function deleteOrganization(id: number): Promise<void> {
  await apiService.delete(`${BASE}/${id}`, true)
}
