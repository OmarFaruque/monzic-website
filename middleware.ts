import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if accessing admin routes
  if (pathname.startsWith("/administrator")) {
    // Check for admin authentication
    const adminToken = request.cookies.get("adminAuthToken")?.value
    const isAdminAuthenticated = request.cookies.get("isAdminAuthenticated")?.value

    // If not authenticated, redirect to admin login
    if (!adminToken || isAdminAuthenticated !== "true") {
      return NextResponse.redirect(new URL("/admin-login", request.url))
    }
  }

  // Add security headers
  const response = NextResponse.next()

  // Security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  return response
}

export const config = {
  matcher: ["/administrator/:path*"],
}
