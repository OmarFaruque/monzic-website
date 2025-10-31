
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quotes, users, settings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { generateInvoicePdf } from '@/lib/invoice';

export async function POST(req: NextRequest) {
  try {
    const { policyNumber } = await req.json();

    if (!policyNumber) {
      return NextResponse.json({ error: 'policyNumber is required' }, { status: 400 });
    }

    // 1. Fetch quote record from the database using policyNumber
    const quoteRecord = await db.select().from(quotes).where(eq(quotes.policyNumber, policyNumber)).limit(1);
    if (!quoteRecord.length) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }
    const quote = quoteRecord[0];

    // 2. Parse quoteData and fetch user data
    const quoteData = JSON.parse(quote.quoteData as string);
    if (!quote.userId) throw new Error('User ID not found on quote');
    const userRecord = await db.select().from(users).where(eq(users.userId, quote.userId)).limit(1);
    if (!userRecord.length) throw new Error('User not found');
    const user = userRecord[0];
    
    // Use the most up-to-date price for the invoice
    const finalAmount = parseFloat(quote.updatePrice || quote.cpw || quoteData.total);
    quoteData.total = finalAmount;
    quoteData.paymentDate = quote.paymentDate;

    const generalSettings = await db.query.settings.findFirst({ where: eq(settings.param, 'general') });
    let siteName = "Tempnow";
    if (generalSettings && generalSettings.value) {
        const parsedSettings = JSON.parse(generalSettings.value as string);
        siteName = parsedSettings.siteName || "Tempnow";
    }

    // 3. Generate the invoice PDF
    const pdfBytes = await generateInvoicePdf(quoteData, user, policyNumber, siteName);

    // 4. Return the PDF as a response
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${policyNumber}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('Error generating invoice:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
