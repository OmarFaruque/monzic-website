import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quotes, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sendEmail, createInsurancePolicyEmail } from '@/lib/email';
import { generateInvoicePdf } from '@/lib/invoice';

export async function POST(req: NextRequest) {
  const originalToJSON = (BigInt.prototype as any).toJSON;
  try {
    (BigInt.prototype as any).toJSON = function () { return Number(this); };

    const { quoteId } = await req.json();

    if (!quoteId) {
      return NextResponse.json({ error: 'quoteId is required' }, { status: 400 });
    }

    // 1. Fetch all necessary data
    const quoteRecord = await db.select().from(quotes).where(eq(quotes.id, quoteId)).limit(1);
    if (!quoteRecord.length) throw new Error('Quote not found');
    const quote = quoteRecord[0];

    // Only send email if the quote is actually paid
    if (quote.status !== 'paid' && quote.status !== 'completed') {
        console.log(`Quote ${quoteId} status is '${quote.status}', not sending confirmation.`);
        return NextResponse.json({ success: true, message: 'Email not sent for non-paid quote.' });
    }

    const fullQuoteData = JSON.parse(quote.quoteData as string);

    if (!quote.userId) throw new Error('User ID not found on quote');
    const userRecord = await db.select().from(users).where(eq(users.userId, quote.userId)).limit(1);
    if (!userRecord.length) throw new Error('User not found');
    const user = userRecord[0];

    const finalAmount = parseFloat(quote.updatePrice || quote.cpw || fullQuoteData.total);
    fullQuoteData.total = finalAmount;
    fullQuoteData.paymentDate = quote.paymentDate;

    // 2. Generate invoice
    const pdfBytes = await generateInvoicePdf(fullQuoteData, user);

    // 3. Send confirmation email
    const emailHtml = createInsurancePolicyEmail(
        `${user.firstName} ${user.lastName}`,
        quote.policyNumber,
        `${fullQuoteData.customerData.vehicle.year} ${fullQuoteData.customerData.vehicle.make} ${fullQuoteData.customerData.vehicle.model}`,
        fullQuoteData.startTime,
        fullQuoteData.expiryTime,
        finalAmount,
        `${process.env.NEXT_PUBLIC_BASE_URL}/policy/details/${quote.policyNumber}`
    );

    await sendEmail({
        to: user.email,
        subject: 'Your Insurance Policy Confirmation',
        html: emailHtml,
        attachments: [{ filename: `invoice-${quote.policyNumber}.pdf`, content: Buffer.from(pdfBytes) }],
    });

    // 4. Mark email as sent
    await db.update(quotes).set({ mailSent: true }).where(eq(quotes.id, quoteId));

    return NextResponse.json({ success: true, message: 'Confirmation email sent.' });

  } catch (error: any) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  } finally {
    (BigInt.prototype as any).toJSON = originalToJSON;
  }
}
