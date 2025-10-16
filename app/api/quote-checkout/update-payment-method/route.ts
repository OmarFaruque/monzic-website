import { db } from '@/lib/db';
import { quotes } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { policyNumber, paymentMethod } = await request.json();

    if (!policyNumber || !paymentMethod) {
      return NextResponse.json({ success: false, error: 'Policy number and payment method are required' }, { status: 400 });
    }

    await db
      .update(quotes)
      .set({ paymentMethod })
      .where(eq(quotes.policyNumber, policyNumber));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
