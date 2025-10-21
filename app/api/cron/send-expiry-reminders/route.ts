import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quotes, users } from '@/lib/schema';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { sendEmail, createPolicyExpiryEmail } from '@/lib/email';

// Define the POST handler logic
async function handleCronRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

    // Find quotes that expire within the next 10 minutes and haven't had an email sent
    const expiringQuotes = await db.select().from(quotes).where(
      and(
        eq(quotes.expiryEmailSent, false),
        eq(quotes.paymentStatus, 'paid'), // Only send for paid policies
        gte(quotes.expiresAt, now.toISOString()),
        lte(quotes.expiresAt, tenMinutesFromNow.toISOString())
      )
    );

    if (expiringQuotes.length === 0) {
      return NextResponse.json({ success: true, message: 'No quotes expiring soon.' });
    }

    for (const quote of expiringQuotes) {
      if (!quote.userId) {
        console.warn(`Quote ${quote.id} has no user ID, skipping expiry email.`);
        continue;
      }

      const userRecord = await db.select().from(users).where(eq(users.userId, quote.userId)).limit(1);
      if (!userRecord.length) {
        console.warn(`User not found for quote ${quote.id}, skipping expiry email.`);
        continue;
      }
      const user = userRecord[0];

      const fullQuoteData = JSON.parse(quote.quoteData as string);

      const emailHtml = await createPolicyExpiryEmail(
        user.firstName || '',
        user.lastName || '',
        quote.policyNumber,
        `${fullQuoteData.customerData.vehicle.year} ${fullQuoteData.customerData.vehicle.make} ${fullQuoteData.customerData.vehicle.model}`,
        quote.expiresAt,
        `${process.env.NEXT_PUBLIC_BASE_URL}/policy/details/${quote.policyNumber}`
      );

      await sendEmail({
        to: user.email,
        subject: 'Your Policy is Expiring Soon',
        html: emailHtml,
      });

      // Mark email as sent
      await db.update(quotes).set({ expiryEmailSent: true }).where(eq(quotes.id, quote.id));
    }

    return NextResponse.json({ success: true, message: `Sent ${expiringQuotes.length} expiry reminders.` });

  } catch (error) {
    console.error('Error sending expiry reminders:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return handleCronRequest(request);
}

export async function GET(request: NextRequest) {
  return handleCronRequest(request);
}
