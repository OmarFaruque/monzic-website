import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings as settingsTable } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const paddleSettings = await db.query.settings.findFirst({
      where: eq(settingsTable.param, 'paddle'),
    });
    if (!paddleSettings || !paddleSettings.value) {
      throw new Error('Paddle settings not found');
    }
    const paddleConfig = JSON.parse(paddleSettings.value as string);
    return NextResponse.json({ vendorId: paddleConfig.vendorId });
  } catch (error) {
    console.error("Error fetching paddle vendor id:", error);
    return NextResponse.json(
      { error: "Failed to fetch paddle vendor id" },
      { status: 500 }
    );
  }
}
