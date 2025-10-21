import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quotes, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sendEmail, createInsurancePolicyEmail } from '@/lib/email';
import { generateInvoicePdf } from '@/lib/invoice';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  // Store original toJSON if it exists to avoid side-effects
  const originalToJSON = (BigInt.prototype as any).toJSON;

  try {
    // Temporarily modify BigInt serialization for this request
    (BigInt.prototype as any).toJSON = function () {
      return Number(this);
    };

    const quoteId = params.id;
    const { PaymentStatus, PaymentMethod, PaymentIntentId } = await req.json();

    if (PaymentStatus !== 'paid') {
      return NextResponse.json({ success: false, message: 'Payment not successful' }, { status: 400 });
    }

    // 1. Update the quote status in the database
    await db.update(quotes).set({
      status:'completed',
      paymentStatus: 'paid',
      paymentMethod: PaymentMethod,
      paymentIntentId: PaymentIntentId,
      paymentDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).where(eq(quotes.id, quoteId));

    // 2. Fetch the necessary data for email and invoice
    const quoteRecord = await db.select().from(quotes).where(eq(quotes.id, quoteId)).limit(1);
    if (!quoteRecord.length) {
      throw new Error('Quote not found');
    }
    const quote = quoteRecord[0];
    const fullQuoteData = JSON.parse(quote.quoteData as string);

    if (!quote.userId) {
      throw new Error('User ID not found on quote');
    }

    const userRecord = await db.select().from(users).where(eq(users.userId, quote.userId)).limit(1);
    if (!userRecord.length) {
      throw new Error('User not found');
    }
    const user = userRecord[0];

    // Use the discounted price if available, otherwise the original total
    const effectivePrice = (quote.updatePrice && quote.updatePrice !== 'false') ? quote.updatePrice : quote.cpw;
    const finalAmount = parseFloat(effectivePrice || fullQuoteData.total);
    fullQuoteData.total = finalAmount; // Ensure the invoice and email use the final amount
    fullQuoteData.paymentDate = quote.paymentDate; // Pass payment date to invoice generator

    // 3. Generate invoice
    const pdfBytes = await generateInvoicePdf(fullQuoteData, user, quote.policyNumber);

    // 4. Send confirmation email
    const vehicle = fullQuoteData.customerData.vehicle;
    const emailHtml = await createInsurancePolicyEmail(
      user.firstName || '',
      user.lastName || '',
      quote.policyNumber,
      vehicle.registration,
      vehicle.make,
      vehicle.model,
      vehicle.year,
      fullQuoteData.startTime,
      fullQuoteData.expiryTime,
      finalAmount,
      `${process.env.NEXT_PUBLIC_BASE_URL}/policy/details/${quote.policyNumber}`
    );

    await sendEmail({
      to: user.email,
      subject: 'Your Insurance Policy Confirmation',
      html: emailHtml,
      attachments: [
        {
          filename: `invoice-${quote.policyNumber}.pdf`,
          content: Buffer.from(pdfBytes),
        },
      ],
    });

    return NextResponse.json({ success: true, message: 'Quote updated and email sent.' });

  } catch (error: any) {
    console.error('Error updating quote and sending email:', error);
    return NextResponse.json({ success: false, message: error.message || 'An internal error occurred.' }, { status: 500 });
  } finally {
    // Restore original toJSON to prevent side-effects
    (BigInt.prototype as any).toJSON = originalToJSON;
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quoteId = params.id;

    if (!quoteId) {
      return NextResponse.json({ success: false, error: 'Quote ID is required' }, { status: 400 });
    }

    await db.delete(quotes).where(eq(quotes.id, parseInt(quoteId, 10)));

    return NextResponse.json({ success: true, message: 'Quote deleted successfully.' });

  } catch (error: any) {
    console.error('Error deleting quote:', error);
    return NextResponse.json({ success: false, message: error.message || 'An internal error occurred.' }, { status: 500 });
  }
}
