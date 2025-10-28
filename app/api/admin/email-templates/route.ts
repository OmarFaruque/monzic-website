import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { settings as settingsTable } from "@/lib/schema";
import { eq } from "drizzle-orm";

const EMAIL_TEMPLATES_PARAM = 'email_templates';

export async function GET(request: NextRequest) {
  try {
    const emailTemplatesSetting = await db.query.settings.findFirst({
      where: eq(settingsTable.param, EMAIL_TEMPLATES_PARAM),
    });

    if (emailTemplatesSetting && emailTemplatesSetting.value) {
      return NextResponse.json({
        success: true,
        templates: JSON.parse(emailTemplatesSetting.value),
      });
    } else {
      // Return default or empty templates if not found
      return NextResponse.json({ success: true, templates: {} });
    }
  } catch (error) {
    console.error("Error fetching email templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch email templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { templates } = await request.json();

    if (!templates) {
      return NextResponse.json(
        { error: "Templates data required" },
        { status: 400 }
      );
    }

    const value = JSON.stringify(templates);

    await db
      .insert(settingsTable)
      .values({ param: EMAIL_TEMPLATES_PARAM, value })
      .onConflictDoUpdate({
        target: settingsTable.param,
        set: { value },
      });

    

    return NextResponse.json({
      success: true,
      message: "Email templates saved successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving email templates:", error);
    return NextResponse.json(
      { error: "Failed to save email templates" },
      { status: 500 }
    );
  }
}
