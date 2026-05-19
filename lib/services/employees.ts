import { apiService } from "./api-service"
import { buildPaginationQuery, type ListPaginationQuery, type PaginatedResponse } from "@/lib/services/pagination"

export type Employee = {
  id: number
  first_name: string
  last_name: string | null
  display_name: string | null
  email: string | null
  mobile: string | null
  department_id: number | null
  department_name: string | null
  designation_id: number | null
  designation_name: string | null
  country_id: number | null
  country_name: string | null
  city: string | null
  office: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type EmployeeDetail = Employee & {
  meta: unknown | null
}

export type CreateEmployeeBody = {
  first_name?: string
  last_name?: string | null
  display_name?: string | null
  email?: string | null
  mobile?: string | null
  department_id?: number | null
  designation_id?: number | null
  country_id?: number | null
  country_name?: string | null
  city?: string | null
  office?: string | null
  is_active?: boolean
}

export type EmployeeListQuery = ListPaginationQuery & {
  search?: string
  status?: "active" | "inactive"
}

const BASE = "/workspace/employees"

export async function getEmployees(): Promise<Employee[]> {
  const json = await apiService.get<Employee[]>(BASE, true)
  return json.data ?? []
}

export async function getEmployeesPage(
  query: EmployeeListQuery,
): Promise<PaginatedResponse<Employee>> {
  const json = await apiService.get<PaginatedResponse<Employee>>(`${BASE}${buildPaginationQuery(query)}`, true)
  return json.data ?? { items: [], pagination: { page: 1, limit: 20, total: 0, total_pages: 0, has_next_page: false, has_previous_page: false } }
}

export async function getEmployeeById(id: number): Promise<EmployeeDetail | null> {
  const json = await apiService.get<EmployeeDetail>(`${BASE}/${id}`, true)
  return json.data ?? null
}
