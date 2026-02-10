import { cookies } from "next/headers"
import { NextResponse } from "next/server"

type BackendApiResponse<T> = {
  success: boolean
  message: string
  data?: T
  timestamp: string
}

type MeResponse = {
  id: number
  username: string
  email: string | null
  mobile: string | null
  first_name: string | null
  last_name: string | null
  role: { id: number; name: string }
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized", timestamp: new Date().toISOString() },
      { status: 401 },
    )
  }

  const backendBase = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:3001"
  const backendRes = await fetch(`${backendBase}/api/v1/auth/me`, {
    method: "GET",
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  const json = (await backendRes.json()) as BackendApiResponse<MeResponse>
  return NextResponse.json(json, { status: backendRes.status })
}

