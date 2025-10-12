import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const squareSettingsRecord = await db.select().from(settings).where(eq(settings.param, 'square'));

    if (squareSettingsRecord.length === 0 || !squareSettingsRecord[0].value) {
      return NextResponse.json({ error: 'Square settings not found in the database.' }, { status: 500 });
    }

    const squareSettings = JSON.parse(squareSettingsRecord[0].value);

    const { appId, appLocationId } = squareSettings;

    if (!appId || !appLocationId) {
      return NextResponse.json({ error: 'Square appId or appLocationId is not configured in the database.' }, { status: 500 });
    }

    return NextResponse.json({ appId, appLocationId });
  } catch (error) {
    console.error("Error fetching square settings:", error);
    return NextResponse.json({ error: 'Failed to fetch square settings.' }, { status: 500 });
  }
}