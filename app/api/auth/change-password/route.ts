import { cookies } from "next/headers"
import { NextResponse } from "next/server"

type BackendApiResponse<T> = {
  success: boolean
  message: string
  data?: T
  timestamp: string
}

function getBackendBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:3001"

  if (raw.startsWith("http") && !raw.includes("/api/v1")) {
    return raw.replace(/\/$/, "") + "/api/v1"
  }

  return raw.replace(/\/$/, "")
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", timestamp: new Date().toISOString() },
        { status: 401 },
      )
    }

    const body = (await req.json()) as {
      current_password?: string
      new_password?: string
      confirm_password?: string
    }

    const backendBase = getBackendBaseUrl()
    const backendRes = await fetch(`${backendBase}/auth/change-password`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const backendJson = (await backendRes.json()) as BackendApiResponse<{ message: string }>
    return NextResponse.json(backendJson, { status: backendRes.status })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to change password"
    return NextResponse.json(
      { success: false, message, timestamp: new Date().toISOString() },
      { status: 500 },
    )
  }
}
