import { NextResponse } from "next/server"
import { getUserById, updateUser } from "@/lib/database"
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

    const user = await getUserById(userId)

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json(
      { error: "Failed to load user data. Please try again later." },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")

    if (!token) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const decodedToken = jwtDecode<DecodedToken>(token.value)
    const userId = decodedToken.id.toString()

    const body = await request.json()

    const updatedUser = await updateUser(userId, body)

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Error updating user data:", error)
    return NextResponse.json(
      { error: "Failed to update user data. Please try again later." },
      { status: 500 },
    )
  }
}
