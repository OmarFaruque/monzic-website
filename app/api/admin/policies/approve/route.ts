import { db } from '@/lib/db';
import { quotes } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { policyId } = await request.json();

    if (!policyId) {
      return NextResponse.json({ success: false, error: 'Policy ID is required' }, { status: 400 });
    }

    // First, retrieve the policy to get the policy number
    const policy = await db.select().from(quotes).where(eq(quotes.id, policyId)).limit(1);

    if (policy.length === 0) {
        return NextResponse.json({ success: false, error: 'Policy not found' }, { status: 404 });
    }

    const policyNumber = policy[0].policyNumber;


    await db
      .update(quotes)
      .set({ paymentStatus: 'paid', status: 'completed', paymentDate: new Date() })
      .where(eq(quotes.id, policyId));

    // After successful update, trigger the confirmation email
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-confirmation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            quoteId: policyId,
        }),
    });


    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving policy:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
