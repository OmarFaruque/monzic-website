
import { db } from '@/lib/db';
import { settings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const paymentSettings = await db.select().from(settings).where(eq(settings.param, 'payment'));

    if (paymentSettings.length === 0) {
      return NextResponse.json({ error: 'Payment setting not found.' }, { status: 404 });
    }

    return NextResponse.json({ paymentProvider: paymentSettings[0].value });
  } catch (error) {
    console.error('Error fetching payment setting:', error);
    return NextResponse.json({ error: 'Failed to fetch payment setting.' }, { status: 500 });
  }
}
