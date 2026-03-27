import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Centralised auth gate.
 *
 * The single source of truth for "is the user logged-in?" is the `auth_token`
 * httpOnly cookie that the `/api/auth/login` route sets.
 *
 * Rules
 * ─────────────────────────────────────────────────
 *  Cookie present + visiting /login  →  redirect /dashboard
 *  Cookie absent  + visiting a protected page             →  redirect /login
 *  Everything else                                        →  pass through
 */

const PUBLIC_PATHS = ["/login"]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Never intercept API routes – they manage their own auth
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  const token = request.cookies.get("auth_token")?.value

  // ── Not authenticated ────────────────────────────────
  if (!token && !isPublicPath(pathname)) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // ── Authenticated but on a public (login) page ───────
  if (token && isPublicPath(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match every path EXCEPT:
     *  - _next/static  (static assets)
     *  - _next/image   (image optimiser)
     *  - favicon.ico
     *  - common image extensions served from /public
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
