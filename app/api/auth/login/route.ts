import { NextResponse } from "next/server"

type BackendApiResponse<T> = {
  success: boolean
  message: string
  data?: T
  timestamp: string
}

type BackendLoginResponse = {
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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      username?: string
      password?: string
      rememberMe?: boolean
    }

    const username = body.username?.trim() ?? ""
    const password = body.password ?? ""
    const rememberMe = body.rememberMe ?? false

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "username and password are required", timestamp: new Date().toISOString() },
        { status: 400 },
      )
    }

    const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001"
    const backendRes = await fetch(`${backendBase}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
      // avoid caching auth responses
      cache: "no-store",
    })

    const backendJson = (await backendRes.json()) as BackendApiResponse<BackendLoginResponse>

    if (!backendRes.ok || !backendJson.success || !backendJson.data) {
      return NextResponse.json(
        {
          success: false,
          message: backendJson.message || "Login failed",
          timestamp: new Date().toISOString(),
        },
        { status: backendRes.status || 401 },
      )
    }

    const token = backendJson.data.token

    const response = NextResponse.json(backendJson, { status: 200 })
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      ...(rememberMe ? { maxAge: 60 * 60 * 24 * 30 } : {}),
    })
    return response
  } catch (e) {
    const message = e instanceof Error ? e.message : "Login failed"
    return NextResponse.json(
      { success: false, message, timestamp: new Date().toISOString() },
      { status: 500 },
    )
  }
}

