import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const bankSettingsRecord = await db
      .select()
      .from(settings)
      .where(eq(settings.param, 'bank'))
      .limit(1);

    if (!bankSettingsRecord || bankSettingsRecord.length === 0 || !bankSettingsRecord[0].value) {
      return NextResponse.json({ success: false, error: 'Bank settings not found.' }, { status: 404 });
    }

    const bankSettings = JSON.parse(bankSettingsRecord[0].value);

    return NextResponse.json({
      success: true,
      settings: bankSettings,
    });
  } catch (error) {
    console.error('Error fetching bank settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bank settings.' }, { status: 500 });
  }
}