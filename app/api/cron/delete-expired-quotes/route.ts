import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quotes } from '@/lib/schema';
import { sql, and, lt, ne, or } from 'drizzle-orm';


export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const deletedQuotes = await db.delete(quotes).where(
      and(
        lt(quotes.createdAt, tenMinutesAgo.toISOString()),
        or(
          ne(quotes.paymentStatus, 'paid'),
          sql`"quotes"."payment_status" IS NULL`
        ),
        or(
          ne(quotes.paymentMethod, 'bank_transfer'),
          sql`"quotes"."payment_method" IS NULL`
        )
      )
    ).returning({ id: quotes.id });

    return NextResponse.json({ success: true, message: `Deleted ${deletedQuotes.length} expired quotes.` });

  } catch (error: any) {
    console.error('Error deleting expired quotes:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
