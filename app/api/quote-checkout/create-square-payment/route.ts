import { NextRequest, NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';
import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { settings, quotes } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sendEmail, createInsurancePolicyEmail } from '@/lib/email';
import { generateInvoicePdf } from '@/lib/invoice';

export async function POST(req: NextRequest) {
  // Store original toJSON if it exists to avoid side-effects
  const originalToJSON = (BigInt.prototype as any).toJSON;

  try {
    // Temporarily modify BigInt serialization to Number for this request
    (BigInt.prototype as any).toJSON = function () {
      return Number(this);
    };

    const squareSettingsRecord = await db.select().from(settings).where(eq(settings.param, 'square'));

    if (squareSettingsRecord.length === 0 || !squareSettingsRecord[0].value) {
      return NextResponse.json({ success: false, details: 'Square settings not found.' }, { status: 500 });
    }

    const squareSettings = JSON.parse(squareSettingsRecord[0].value);
    const { accessToken, appLocationId, environment } = squareSettings;

    if (!accessToken || !appLocationId) {
      return NextResponse.json({ success: false, details: 'Square access token or location ID is not configured.' }, { status: 500 });
    }

    const squareClient = new SquareClient({
      environment: environment === 'sandbox' ? SquareEnvironment.Sandbox : SquareEnvironment.Production,
      token: accessToken,
    });

    const { sourceId, quoteData, user } = await req.json();


    if (!sourceId || !quoteData || !user || !quoteData.id) {
      return NextResponse.json({ success: false, details: "Missing required payment information or quote ID." }, { status: 400 });
    }

    const amount = quoteData.total || 0;
    if (amount <= 0) {
      return NextResponse.json({ success: false, details: "Payment amount must be positive." }, { status: 400 });
    }

    const totalAmount = BigInt(Math.round(amount * 100));

    // Fetch site name and currency from settings
    const generalSettings = await db.query.settings.findFirst({
      where: eq(settings.param, 'general')
    });
    let siteName = "";
    let currency = "GBP"; // Default currency
    if (generalSettings && generalSettings.value) {
      const parsedSettings = JSON.parse(generalSettings.value);
      siteName = parsedSettings.siteName || "";
      currency = parsedSettings.currency || "GBP";
    }

    const paymentResult = await squareClient.payments.create({
        sourceId,
        idempotencyKey: randomUUID(),
        locationId: appLocationId,
        amountMoney: {
            amount: totalAmount,
            currency: currency,
        },
        note: `${siteName} Docs: Policy ${quoteData.id}`,
    });



    

    if (paymentResult.payment) {
      // Update database
      await db.update(quotes).set({
        paymentStatus: 'paid',
        status: 'completed',
        userId: user.id,
        spaymentId: paymentResult.payment.id,
        paymentMethod: 'square',
        paymentDate: new Date().toISOString(),
        mailSent: true,
        updatedAt: new Date().toISOString()
      }).where(eq(quotes.id, quoteData.id));

      // Fetch the updated quote to get the policy number
      const quoteRecord = await db.select().from(quotes).where(eq(quotes.id, quoteData.id)).limit(1);
      if (!quoteRecord.length) {
        throw new Error('Quote not found after update');
      }
      const quote = quoteRecord[0];

      // Use the stored discounted price, fallback to original price (cpw)
      const effectivePrice = (quote.updatePrice && quote.updatePrice !== 'false') ? quote.updatePrice : quote.cpw;
      const finalAmount = parseFloat(effectivePrice || quoteData.total);

      // Generate invoice
      const pdfBytes = await generateInvoicePdf({ ...quoteData, total: finalAmount, paymentDate: quote.paymentDate }, user, quote.policyNumber);

      // Send confirmation email
      const vehicle = quoteData.customerData.vehicle;
      const emailHtml = await createInsurancePolicyEmail(
        user.firstName || '',
        user.lastName || '',
        quote.policyNumber,
        vehicle.registration,
        vehicle.make,
        vehicle.model,
        vehicle.year,
        quoteData.startTime,
        quoteData.expiryTime,
        finalAmount,
        `${process.env.NEXT_PUBLIC_BASE_URL}/policy/details/${quote.policyNumber}`,
        quoteData.coverReason || 'N/A'
      );

      await sendEmail({
        to: user.email,
        subject: emailHtml.subject,
        html: emailHtml.html,
        attachments: [
          {
            filename: `invoice-${quote.policyNumber}.pdf`,
            content: Buffer.from(pdfBytes),
          },
        ],
      });
    }

    return NextResponse.json({ success: true, payment: paymentResult.payment });
  } catch (error: any) {
    console.error('Square payment error:', error);
    const errorMessage = error?.errors?.[0]?.detail || "An unexpected error occurred during payment.";
    return NextResponse.json({ success: false, details: errorMessage }, { status: 500 });
  } finally {
    // Restore original toJSON to prevent side-effects
    (BigInt.prototype as any).toJSON = originalToJSON;
  }
}
