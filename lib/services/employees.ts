import { apiService } from "./api-service"

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

const BASE = "/workspace/employees"

export async function getEmployees(): Promise<Employee[]> {
  const json = await apiService.get<Employee[]>(BASE, true)
  return json.data ?? []
}

export async function getEmployeeById(id: number): Promise<EmployeeDetail | null> {
  const json = await apiService.get<EmployeeDetail>(`${BASE}/${id}`, true)
  return json.data ?? null
}
