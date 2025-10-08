
import { db } from '@/lib/db';
import { settings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const stripeSettings = await db.select().from(settings).where(eq(settings.param, 'stripe'));

    if (stripeSettings.length === 0) {
      return NextResponse.json({ error: 'Stripe settings not found.' }, { status: 404 });
    }

    const stripeConfig = JSON.parse(stripeSettings[0].value!)

    return NextResponse.json({ publishableKey: stripeConfig.publishableKey });
  } catch (error) {
    console.error('Error fetching Stripe settings:', error);
    return NextResponse.json({ error: 'Failed to fetch Stripe settings.' }, { status: 500 });
  }
}
