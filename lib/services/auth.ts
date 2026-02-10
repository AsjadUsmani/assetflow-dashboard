import { ApiException, apiService, type ApiResponse } from "./api-service"
import { handleGlobalApiError } from "./globalApiErrorHandler"

export type LoginInput = {
  username: string
  password: string
  rememberMe?: boolean
}

export type LoginResult = {
  token: string
  user: {
    id: number
    username: string
    email: string | null
    mobile: string | null
    first_name: string | null
    last_name: string | null
    role: { id: number; name: string }
  }
  mode: string
}

export type MeResult = {
  id: number
  username: string
  email: string | null
  mobile: string | null
  first_name: string | null
  last_name: string | null
  role: { id: number; name: string }
}

export async function login(input: LoginInput): Promise<LoginResult> {
  // Call local Next API route directly so the browser can store the httpOnly cookie
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  })

  const json = (await res.json()) as ApiResponse<LoginResult>
  if (!res.ok || !json.success || !json.data) {
    const error = new ApiException(json.message || "Login failed", res.status)
    handleGlobalApiError(error)
    throw error
  }

  const result = json.data

  // Store access token and user in localStorage for client-side usage
  if (typeof window !== "undefined" && result) {
    if (result.token) {
      window.localStorage.setItem("auth_token", result.token)
    }
    window.localStorage.setItem("auth_user", JSON.stringify(result.user))
  }

  return result
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" })

  if (typeof window !== "undefined") {
    window.localStorage.removeItem("auth_token")
    window.localStorage.removeItem("auth_user")
  }
}

export async function me(): Promise<MeResult> {
  // Call backend via shared ApiService; auth is cookie-based, so no bearer token needed
  const json = await apiService.get<MeResult>("/auth/me", true)

  if (!json.success || !json.data) {
    const error = new ApiException(json.message || "Unauthorized")
    handleGlobalApiError(error)
    throw error
  }

  return json.data
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return !!window.localStorage.getItem("auth_token")
}

export function getAuthUser(): MeResult | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem("auth_user")
    if (!raw) return null
    return JSON.parse(raw) as MeResult
  } catch {
    return null
  }
}

