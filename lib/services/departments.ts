import { apiService } from "./api-service"
import { buildPaginationQuery, type ListPaginationQuery, type PaginatedResponse } from "@/lib/services/pagination"

export type DepartmentVenueContact = {
  location_id: number
  location_name: string
  phone: string | null
  email: string | null
}

export type Department = {
  id: number
  name: string
  code: string | null
  location_ids: number[]
  location_names: string[]
  location_name?: string
  venue_contacts: DepartmentVenueContact[]
  organization_id?: number
  organization_name?: string
  hod_id: number | null
  hod_name?: string | null
  phone: string | null
  email: string | null
  description: string | null
  created_at: string
  assets_count?: number
}

export type DepartmentVenueContactInput = {
  location_id: number
  phone?: string | null
  email?: string | null
}

export type CreateDepartmentBody = {
  name: string
  location_ids: number[]
  venue_contacts?: DepartmentVenueContactInput[]
  code?: string
  hod_id?: number
  description?: string
}

export type UpdateDepartmentBody = Partial<CreateDepartmentBody>

export type DepartmentListQuery = ListPaginationQuery & {
  search?: string
  location_id?: number
}

const BASE = "/workspace/departments"

export async function getDepartments(locationId?: number): Promise<Department[]> {
  const params = locationId != null ? `?location_id=${locationId}` : ""
  const json = await apiService.get<Department[]>(`${BASE}${params}`, true)
  return json.data ?? []
}

export async function getDepartmentsPage(
  query: DepartmentListQuery,
): Promise<PaginatedResponse<Department>> {
  const json = await apiService.get<PaginatedResponse<Department>>(`${BASE}${buildPaginationQuery(query)}`, true)
  return json.data ?? { items: [], pagination: { page: 1, limit: 20, total: 0, total_pages: 0, has_next_page: false, has_previous_page: false } }
}

export async function getDepartmentById(id: number): Promise<Department | null> {
  const json = await apiService.get<Department>(`${BASE}/${id}`, true)
  return json.data ?? null
}

export async function createDepartment(body: CreateDepartmentBody): Promise<Department> {
  const json = await apiService.post<Department>(BASE, body, true)
  if (!json.data) throw new Error(json.message ?? "Failed to create department")
  return json.data
}

export async function updateDepartment(
  id: number,
  body: UpdateDepartmentBody
): Promise<Department> {
  const json = await apiService.put<Department>(`${BASE}/${id}`, body, true)
  if (!json.data) throw new Error(json.message ?? "Failed to update department")
  return json.data
}

export async function deleteDepartment(id: number): Promise<void> {
  await apiService.delete(`${BASE}/${id}`, true)
}
