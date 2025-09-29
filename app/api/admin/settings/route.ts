import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { settings as settingsTable } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const settingsFromDb = await db.select().from(settingsTable);

    const settings = settingsFromDb.reduce((acc, setting) => {
      try {
        // The value is stored as a JSON string, so we need to parse it.
        // Make sure to handle cases where parsing might fail.
        acc[setting.param] = setting.value ? JSON.parse(setting.value) : {};
      } catch (e) {
        console.error(`Failed to parse setting value for param: ${setting.param}`, e);
        // Assign a default or empty object if parsing fails
        acc[setting.param] = {};
      }
      return acc;
    }, {} as { [key: string]: any });

    return NextResponse.json({
      success: true,
      settings: settings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json();

    if (!settings) {
      return NextResponse.json(
        { error: "Settings data required" },
        { status: 400 }
      );
    }

    // Use a transaction to ensure all settings are saved or none are.
    await db.transaction(async (tx) => {
      for (const key in settings) {
        if (Object.prototype.hasOwnProperty.call(settings, key)) {
          const value = JSON.stringify(settings[key]);
          await tx
            .insert(settingsTable)
            .values({ param: key, value: value })
            .onConflictDoUpdate({
              target: settingsTable.param,
              set: { value: value },
            });
        }
      }
    });

    // Redact sensitive data before logging
    const logData = JSON.parse(JSON.stringify(settings));
    if (logData.paddle?.apiKey) logData.paddle.apiKey = "[REDACTED]";
    if (logData.openai?.apiKey) logData.openai.apiKey = "[REDACTED]";
    if (logData.resend?.apiKey) logData.resend.apiKey = "[REDACTED]";
    if (logData.vehicleApi?.apiKey) logData.vehicleApi.apiKey = "[REDACTED]";
    if (logData.stripe?.secretKey) logData.stripe.secretKey = "[REDACTED]";
    if (logData.mollie?.apiKey) logData.mollie.apiKey = "[REDACTED]";


    console.log("Settings updated:", logData);

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}