import { apiService } from "./api-service"

export type Property = {
  id: number
  name: string
  code: string
  description?: string | null
  data_type: string
  config?: Record<string, unknown> | null
  required: boolean
  usedIn: string[]
  created_at: string
}

export type CreatePropertyBody = {
  name: string
  code: string
  description?: string
  data_type: string
  usedIn?: string[]
  config?: Record<string, unknown>
}

export type UpdatePropertyBody = {
  name?: string
  description?: string
  data_type?: string
  config?: Record<string, unknown>
}

const BASE = "/workspace/properties"

export async function getProperties(): Promise<Property[]> {
  const json = await apiService.get<Property[]>(BASE, true)
  return json.data ?? []
}

export async function getPropertyById(id: number): Promise<Property | null> {
  const json = await apiService.get<Property>(`${BASE}/${id}`, true)
  return json.data ?? null
}

export async function createProperty(body: CreatePropertyBody): Promise<Property> {
  const json = await apiService.post<Property>(BASE, body, true)
  if (!json.data) throw new Error(json.message ?? "Failed to create property")
  return json.data
}

export async function updateProperty(id: number, body: UpdatePropertyBody): Promise<Property> {
  const json = await apiService.put<Property>(`${BASE}/${id}`, body, true)
  if (!json.data) throw new Error(json.message ?? "Failed to update property")
  return json.data
}

export async function deleteProperty(id: number): Promise<void> {
  await apiService.delete(`${BASE}/${id}`, true)
}

