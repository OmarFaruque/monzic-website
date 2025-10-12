import { NextResponse } from "next/server"
import { getPoliciesByUserId, getUserById } from "@/lib/database"
import { jwtDecode } from "jwt-decode"
import { cookies } from "next/headers"

interface DecodedToken {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  iat: number
  exp: number
}

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")

    if (!token) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const decodedToken = jwtDecode<DecodedToken>(token.value)
    
    const userId = decodedToken.id.toString()

    const [policies, user] = await Promise.all([
      getPoliciesByUserId(userId),
      getUserById(userId),
    ])

    return NextResponse.json({ policies, user })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json(
      { error: "Failed to load dashboard data. Please try again later." },
      { status: 500 },
    )
  }
}
