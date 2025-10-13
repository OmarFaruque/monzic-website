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

    const paymentResult = await squareClient.payments.create({
        sourceId,
        idempotencyKey: randomUUID(),
        locationId: appLocationId,
        amountMoney: {
            amount: totalAmount,
            currency: "USD", // Reverted to hardcoded USD for stability
        },
    });



    console.log('paymentResult: ', paymentResult);

    if (paymentResult.payment) {
      // Update database
      await db.update(quotes).set({
        status: 'paid',
        userId: user.id,
        transactionId: paymentResult.payment.id,
        paymentProvider: 'square'
      }).where(eq(quotes.id, quoteData.id));

      // Generate invoice
      const pdfBytes = await generateInvoicePdf(quoteData, user);

      // Send confirmation email
      const vehicle = quoteData.customerData.vehicle;
      const emailHtml = createInsurancePolicyEmail(
        `${user.firstName} ${user.lastName}`,
        quoteData.id, // Using quote ID as policy number
        `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        quoteData.startTime,
        quoteData.expiryTime,
        quoteData.total,
        `${process.env.NEXT_PUBLIC_BASE_URL}/policy/details/${quoteData.id}` // Example link
      );

      await sendEmail({
        to: user.email,
        subject: 'Your Insurance Policy Confirmation',
        html: emailHtml,
        attachments: [
          {
            filename: `invoice-${quoteData.id}.pdf`,
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
