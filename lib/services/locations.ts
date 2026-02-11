import { apiService } from "./api-service"

export type Location = {
  id: number
  organization_id: number
  organization_name?: string
  name: string
  address: string
  city: string | null
  state: string | null
  postal_code: string | null
  country_code: string | null
  phone: string | null
  email: string | null
  notes: string | null
  created_at: string
  departments_count?: number
}

export type CreateLocationBody = {
  organization_id: number
  name: string
  address: string
  city?: string
  state?: string
  postal_code?: string
  country_code?: string
  phone?: string
  email?: string
  notes?: string
}

export type UpdateLocationBody = Partial<CreateLocationBody>

const BASE = "/workspace/locations"

export async function getLocations(): Promise<Location[]> {
  const json = await apiService.get<Location[]>(BASE, true)
  return json.data ?? []
}

export async function getLocationById(id: number): Promise<Location | null> {
  const json = await apiService.get<Location>(`${BASE}/${id}`, true)
  return json.data ?? null
}

export async function createLocation(body: CreateLocationBody): Promise<Location> {
  const json = await apiService.post<Location>(BASE, body, true)
  if (!json.data) throw new Error(json.message ?? "Failed to create location")
  return json.data
}

export async function updateLocation(
  id: number,
  body: UpdateLocationBody
): Promise<Location> {
  const json = await apiService.put<Location>(`${BASE}/${id}`, body, true)
  if (!json.data) throw new Error(json.message ?? "Failed to update location")
  return json.data
}

export async function deleteLocation(id: number): Promise<void> {
  await apiService.delete(`${BASE}/${id}`, true)
}
