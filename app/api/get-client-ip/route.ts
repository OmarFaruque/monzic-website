import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get client IP from various headers
    const forwarded = request.headers.get("x-forwarded-for")
    const realIP = request.headers.get("x-real-ip")
    const cfConnectingIP = request.headers.get("cf-connecting-ip")

    let clientIP = "unknown"

    if (cfConnectingIP) {
      clientIP = cfConnectingIP
    } else if (forwarded) {
      clientIP = forwarded.split(",")[0].trim()
    } else if (realIP) {
      clientIP = realIP
    }

    return NextResponse.json({
      success: true,
      ip: clientIP,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Failed to get client IP",
      ip: "unknown",
    })
  }
}
