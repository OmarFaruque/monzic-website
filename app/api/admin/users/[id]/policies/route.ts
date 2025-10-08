import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quotes } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const userPolicies = await db.select().from(quotes).where(eq(quotes.userId, userId));

    return NextResponse.json(userPolicies);
  } catch (error) {
    console.error('Error fetching user policies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
