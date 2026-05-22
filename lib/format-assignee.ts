import type { SearchableSelectOption } from "@/components/ui/searchable-select"
import type { Employee } from "@/lib/services/employees"
import type { WorkspaceUser } from "@/lib/services/workspace-users"

export const ASSIGNEE_USER_PREFIX = "user:"
export const ASSIGNEE_EMPLOYEE_PREFIX = "employee:"

function userDisplayName(user: WorkspaceUser): string {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim()
  return fullName || user.title?.trim() || user.username.trim()
}

function employeeDisplayName(employee: Employee): string {
  return (
    employee.display_name?.trim() ||
    [employee.first_name, employee.last_name].filter(Boolean).join(" ").trim() ||
    employee.first_name
  )
}

export function parseAssigneeValue(value: string): {
  assigned_to_user_id: number | null
  assigned_to_employee_id: number | null
} {
  if (!value) return { assigned_to_user_id: null, assigned_to_employee_id: null }
  if (value.startsWith(ASSIGNEE_EMPLOYEE_PREFIX)) {
    const id = Number(value.slice(ASSIGNEE_EMPLOYEE_PREFIX.length))
    return Number.isInteger(id) && id > 0
      ? { assigned_to_user_id: null, assigned_to_employee_id: id }
      : { assigned_to_user_id: null, assigned_to_employee_id: null }
  }
  if (value.startsWith(ASSIGNEE_USER_PREFIX)) {
    const id = Number(value.slice(ASSIGNEE_USER_PREFIX.length))
    return Number.isInteger(id) && id > 0
      ? { assigned_to_user_id: id, assigned_to_employee_id: null }
      : { assigned_to_user_id: null, assigned_to_employee_id: null }
  }
  const legacyId = Number(value)
  if (Number.isInteger(legacyId) && legacyId > 0) {
    return { assigned_to_user_id: legacyId, assigned_to_employee_id: null }
  }
  return { assigned_to_user_id: null, assigned_to_employee_id: null }
}

export function assigneeValueFromAsset(asset: {
  assigned_to_user_id: number | null
  assigned_to_employee_id?: number | null
}): string {
  if (asset.assigned_to_user_id) return `${ASSIGNEE_USER_PREFIX}${asset.assigned_to_user_id}`
  if (asset.assigned_to_employee_id) return `${ASSIGNEE_EMPLOYEE_PREFIX}${asset.assigned_to_employee_id}`
  return ""
}

export function buildUserAssigneeOption(user: WorkspaceUser): SearchableSelectOption {
  const name = userDisplayName(user)
  const email = user.email?.trim()
  const badges: string[] = ["User"]
  if (!user.is_active) badges.push("Inactive")
  if (user.email_on_hold) badges.push("Email on hold")

  return {
    value: `${ASSIGNEE_USER_PREFIX}${user.id}`,
    label: name,
    description: email,
    badges,
    searchValue: [name, user.username, email, user.first_name, user.last_name, user.title]
      .filter(Boolean)
      .join(" "),
  }
}

export function buildEmployeeAssigneeOption(employee: Employee): SearchableSelectOption {
  const name = employeeDisplayName(employee)
  const email = employee.email?.trim()
  const badges = ["Employee"]
  if (!employee.is_active) badges.push("Inactive")

  return {
    value: `${ASSIGNEE_EMPLOYEE_PREFIX}${employee.id}`,
    label: name,
    description: email,
    badges,
    searchValue: [name, email, employee.first_name, employee.last_name, employee.display_name]
      .filter(Boolean)
      .join(" "),
  }
}

export function buildAssigneeSelectOptions(
  users: WorkspaceUser[],
  employees: Employee[],
  opts?: { alwaysIncludeEmployeeIds?: number[] },
): SearchableSelectOption[] {
  const activeUsers = users.filter((u) => u.is_active || u.email_on_hold)
  const alwaysEmpIds = new Set(opts?.alwaysIncludeEmployeeIds ?? [])
  const activeEmployees = employees.filter((e) => e.is_active || alwaysEmpIds.has(e.id))
  const userEmails = new Set(
    activeUsers.map((u) => u.email?.trim().toLowerCase()).filter((e): e is string => Boolean(e)),
  )
  const employeesOnly = activeEmployees.filter(
    (e) => !e.email?.trim() || !userEmails.has(e.email.trim().toLowerCase()),
  )

  return [
    ...activeUsers.map(buildUserAssigneeOption),
    ...employeesOnly.map(buildEmployeeAssigneeOption),
  ].sort((a, b) => a.label.localeCompare(b.label))
}

/** Display from API asset assignee fields */
export function formatAssigneeDisplay(
  name: string | null | undefined,
  email: string | null | undefined,
  username?: string | null,
): string {
  const displayName = name?.trim() || username?.trim()
  const em = email?.trim()
  if (displayName && em) return `${displayName} (${em})`
  if (em) return em
  if (displayName) return displayName
  return "—"
}

export function hasAssetAssignee(asset: {
  assigned_to_user_id: number | null
  assigned_to_employee_id?: number | null
}): boolean {
  return asset.assigned_to_user_id != null || asset.assigned_to_employee_id != null
}
