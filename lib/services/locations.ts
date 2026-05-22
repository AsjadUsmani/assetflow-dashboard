import { apiService } from "./api-service"
import { buildPaginationQuery, type ListPaginationQuery, type PaginatedResponse } from "@/lib/services/pagination"

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
  assets_count?: number
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

export type LocationListQuery = ListPaginationQuery & {
  search?: string
}

/** Department linked to a specific location (venue-wise contact). */
export type LocationDepartment = {
  id: number
  name: string
  code: string | null
  phone: string | null
  email: string | null
  hod_id: number | null
  hod_name: string | null
  assets_count: number
}

const BASE = "/workspace/locations"

export async function getLocations(): Promise<Location[]> {
  const json = await apiService.get<Location[]>(BASE, true)
  return json.data ?? []
}

export async function getLocationsPage(
  query: LocationListQuery,
): Promise<PaginatedResponse<Location>> {
  const json = await apiService.get<PaginatedResponse<Location>>(`${BASE}${buildPaginationQuery(query)}`, true)
  return json.data ?? { items: [], pagination: { page: 1, limit: 20, total: 0, total_pages: 0, has_next_page: false, has_previous_page: false } }
}

export async function getLocationById(id: number): Promise<Location | null> {
  const json = await apiService.get<Location>(`${BASE}/${id}`, true)
  return json.data ?? null
}

export async function getLocationDepartments(locationId: number): Promise<LocationDepartment[]> {
  const json = await apiService.get<LocationDepartment[]>(`${BASE}/${locationId}/departments`, true)
  return json.data ?? []
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
