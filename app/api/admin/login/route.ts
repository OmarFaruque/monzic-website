import { type NextRequest, NextResponse } from "next/server"
import { validateAdminCredentials } from "@/lib/admin-auth"
import { sign } from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password, clientIP } = await request.json()




    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    const result = await validateAdminCredentials(email, password, clientIP || "unknown")

    if (result.rateLimited) {
      return NextResponse.json({ success: false, error: result.error }, { status: 429 })
    }

    if (!result.isValid || !result.user) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 })
    }


    const token = sign({ id: result.user.id, email: result.user.email, role: result.user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
      token,
    })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
