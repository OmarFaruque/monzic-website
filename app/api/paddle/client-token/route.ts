import { NextResponse } from "next/server";
import { getPaddleClientToken } from "@/lib/paddle";

export async function GET() {
  try {
    const clientToken = await getPaddleClientToken();
    return NextResponse.json({ clientToken });
  } catch (error) {
    console.error("Error getting paddle client token:", error);
    return NextResponse.json(
      { error: "Failed to get paddle client token" },
      { status: 500 }
    );
  }
}