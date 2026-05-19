import { apiService } from "./api-service"
import { buildPaginationQuery, type ListPaginationQuery, type PaginatedResponse } from "@/lib/services/pagination"

export type Department = {
  id: number
  location_id: number
  location_name?: string
  organization_id?: number
  organization_name?: string
  name: string
  code: string | null
  hod_id: number | null
  hod_name?: string | null
  phone: string | null
  email: string | null
  description: string | null
  created_at: string
  assets_count?: number
}

export type CreateDepartmentBody = {
  location_id: number
  name: string
  code?: string
  hod_id?: number
  phone?: string
  email?: string
  description?: string
}

export type UpdateDepartmentBody = Partial<CreateDepartmentBody>

export type DepartmentListQuery = ListPaginationQuery & {
  search?: string
}

const BASE = "/workspace/departments"

export async function getDepartments(): Promise<Department[]> {
  const json = await apiService.get<Department[]>(BASE, true)
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
