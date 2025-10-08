import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { tickets } from "@/lib/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
    const allTickets = await db.select().from(tickets).orderBy(desc(tickets.updatedAt))
    return NextResponse.json(allTickets)
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}