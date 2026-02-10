import { handleGlobalApiError } from "./globalApiErrorHandler"

/**
 * API Service
 * Handles all API requests with authentication token management
 */

// Prefer explicit backend URL, then fall back to local Next.js API routes.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "/api"

export interface ApiResponse<T = unknown> { 
  success: boolean
  message: string
  data?: T
  timestamp?: string
}

export interface ApiError {
  success: false
  message: string
  timestamp?: string
}

export interface BackendErrorData {
  type?: string
  code?: string
  target?: string
}

export class ApiException extends Error {
  status?: number
  data?: BackendErrorData

  constructor(message: string, status?: number, data?: BackendErrorData) {
    super(message)
    this.name = "ApiException"
    this.status = status
    this.data = data
  }
}

class ApiService {
  private baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL
  }

  /**
   * Get the stored authentication token
   */
  private getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("auth_token")
  }

  /**
   * Store the authentication token
   */
  setToken(token: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem("auth_token", token)
  }

  /**
   * Remove the authentication token
   */
  removeToken(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem("auth_token")
  }


  private appendQueryParam(url: string, key: string, value: string): string {
    const separator = url.includes("?") ? "&" : "?"
    return `${url}${separator}${key}=${encodeURIComponent(value)}`
  }

  private appendDefaultQueryParams(endpoint: string): string {
    let url = endpoint
    // const buId = this.getSelectedBusinessUnitId()
    // if (buId) url = this.appendQueryParam(url, "active_bu_id", buId)
    // const terminalCode = this.getTerminalCode()
    // if (terminalCode) url = this.appendQueryParam(url, "terminal_code", terminalCode)
    return url
  }

  /**
   * Get authorization headers
   */
  private getHeaders(includeAuth: boolean = true, isFormData: boolean = false, token?: string | null): HeadersInit {
    const headers: HeadersInit = {}

    // Don't set Content-Type for FormData - browser will set it with boundary
    if (!isFormData) {
      headers["Content-Type"] = "application/json"
    }

    if (includeAuth) {
      // Use provided token, or fall back to localStorage token
      const authToken = token !== undefined ? token : this.getToken()
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`
      }
    }

    return headers
  }

  /**
   * Handle logout on 401 Unauthorized
   */
  private handleLogout(): void {
    if (typeof window === "undefined") return

    // Remove token
    this.removeToken()

    // Clear user-related localStorage items
    const savedTheme = localStorage.getItem("theme")
    localStorage.clear()

    // Restore theme if it was saved
    if (savedTheme) {
      localStorage.setItem("theme", savedTheme)
    }

    // Redirect to login page
    window.location.href = "/login"
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    // Handle 401 Unauthorized - logout user
    if (response.status === 401) {
      this.handleLogout()
      throw new Error("Session expired. Please login again.")
    }

    const data = await response.json()

    if (!response.ok) {
      throw (() => {
        const error = new ApiException(
          data?.message || "Something went wrong",
          response.status,
          data?.data
        )

        // GLOBAL ERROR HANDLING HERE
        handleGlobalApiError(error)

        return error
      })()
    }

    return data
  }

  /**
   * Make a GET request
   * @param endpoint - API endpoint
   * @param includeAuth - Whether to include authentication token (default: true)
   * @param token - Optional token to use for authentication (useful for server-side calls)
   */
  async get<T>(
    endpoint: string,
    includeAuth: boolean = true,
    token?: string | null
  ): Promise<ApiResponse<T>> {
    const url = this.appendDefaultQueryParams(endpoint)

    const response = await fetch(`${this.baseURL}${url}`, {
      method: "GET",
      headers: this.getHeaders(includeAuth, false, token),
    })

    return this.handleResponse<T>(response)
  }


  /**
   * Make a POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    includeAuth: boolean = true,
  ): Promise<ApiResponse<T>> {
    const url = this.appendDefaultQueryParams(endpoint)
    const response = await fetch(`${this.baseURL}${url}`, {
      method: "POST",
      headers: this.getHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  /**
   * Make a PUT request
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    includeAuth: boolean = true,
  ): Promise<ApiResponse<T>> {
    const isFormData = data instanceof FormData
    const url = this.appendDefaultQueryParams(endpoint)
    const response = await fetch(`${this.baseURL}${url}`, {
      method: "PUT",
      headers: this.getHeaders(includeAuth, isFormData),
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    })

    return this.handleResponse<T>(response)
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: unknown,
    includeAuth: boolean = true,
  ): Promise<ApiResponse<T>> {
    const url = this.appendDefaultQueryParams(endpoint)
    const response = await fetch(`${this.baseURL}${url}`, {
      method: "PATCH",
      headers: this.getHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  /**
   * Make a DELETE request
   * @param endpoint - API endpoint
   * @param includeAuth - Whether to include authentication token (default: true)
   * @param token - Optional token to use for authentication (useful for server-side calls)
   */
  async delete<T>(endpoint: string, includeAuth: boolean = true, token?: string | null): Promise<ApiResponse<T>> {
    const url = this.appendDefaultQueryParams(endpoint)
    const response = await fetch(`${this.baseURL}${url}`, {
      method: "DELETE",
      headers: this.getHeaders(includeAuth, false, token),
    })

    return this.handleResponse<T>(response)
  }

  /**
   * Upload a file (multipart/form-data)
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    includeAuth: boolean = true,
  ): Promise<ApiResponse<T>> {
    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error("File size exceeds 5MB limit.")
    }

    // Create FormData
    const formData = new FormData()
    formData.append("file", file)

    const url = this.appendDefaultQueryParams(endpoint)
    const response = await fetch(`${this.baseURL}${url}`, {
      method: "POST",
      headers: this.getHeaders(includeAuth, true),
      body: formData,
    })

    return this.handleResponse<T>(response)
  }
  /**
   * Make a GET request for files (PDF, Excel, CSV, etc.)
   * Returns raw Blob without JSON parsing
  */
  async getFile(
    endpoint: string,
    includeAuth: boolean = true,
    token?: string | null
  ): Promise<Blob> {
    const url = this.appendDefaultQueryParams(endpoint)
    const response = await fetch(`${this.baseURL}${url}`, {
      method: "GET",
      headers: {
        ...(includeAuth ? this.getHeaders(true, false, token) : {}),
        Accept: "*/*",
      },
    })

    if (!response.ok) {
      throw new Error(`File download failed: ${response.statusText}`)
    }

    return await response.blob()
  }
  /**
   * Make a POST request for files (PDF, Excel, etc.)
   * Returns raw Blob without JSON parsing
   */
  async postFile(
    endpoint: string,
    data?: unknown,
    includeAuth: boolean = true,
    token?: string | null
  ): Promise<Blob> {
    const url = this.appendDefaultQueryParams(endpoint)
    const response = await fetch(`${this.baseURL}${url}`, {
      method: "POST",
      headers: {
        ...(includeAuth ? this.getHeaders(true, false, token) : {}),
        Accept: "application/pdf",
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`File download failed: ${response.statusText}`)
    }

    return await response.blob()
  }
}

// Export a singleton instance
export const apiService = new ApiService()

