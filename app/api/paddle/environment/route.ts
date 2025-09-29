import { NextResponse } from "next/server";
import { getPaddleEnvironment } from "@/lib/paddle";

export async function GET() {
  try {
    const environment = await getPaddleEnvironment();
    return NextResponse.json({ environment });
  } catch (error) {
    console.error("Error getting paddle environment:", error);
    return NextResponse.json(
      { error: "Failed to get paddle environment" },
      { status: 500 }
    );
  }
}
