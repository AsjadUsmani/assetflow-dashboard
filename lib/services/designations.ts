import { apiService } from "./api-service"

export type Designation = {
  id: number
  name: string
  code: string | null
  description: string | null
  is_active: boolean
  created_at: string
}

const BASE = "/workspace/designations"

export async function getDesignations(): Promise<Designation[]> {
  const json = await apiService.get<Designation[]>(BASE, true)
  return json.data ?? []
}

export async function getDesignationById(id: number): Promise<Designation | null> {
  const json = await apiService.get<Designation>(`${BASE}/${id}`, true)
  return json.data ?? null
}

export async function createDesignation(body: {
  name: string
  code?: string | null
  description?: string | null
  is_active?: boolean
}): Promise<Designation> {
  const json = await apiService.post<Designation>(BASE, body, true)
  if (!json.data) throw new Error(json.message ?? "Failed to create designation")
  return json.data
}

export async function updateDesignation(
  id: number,
  body: {
    name?: string
    code?: string | null
    description?: string | null
    is_active?: boolean
  },
): Promise<Designation> {
  const json = await apiService.put<Designation>(`${BASE}/${id}`, body, true)
  if (!json.data) throw new Error(json.message ?? "Failed to update designation")
  return json.data
}

export async function deleteDesignation(id: number): Promise<void> {
  await apiService.delete(`${BASE}/${id}`, true)
}
