import { NextRequest, NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';
import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { settings } from '@/lib/schema';
import { eq } from 'drizzle-orm';


export async function POST(req: NextRequest) {
  try {
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

    if (!sourceId || !quoteData || !user) {
      return NextResponse.json({ success: false, details: "Missing required payment information." }, { status: 400 });
    }

    const amount = quoteData.total || 0;
    if (amount <= 0) {
      return NextResponse.json({ success: false, details: "Payment amount must be positive." }, { status: 400 });
    }

    BigInt.prototype.toJSON = function () { return this.toString(); };
    const totalAmount = BigInt(Math.round(amount * 100));




    
    const result = await squareClient.payments.create({
        sourceId,
        idempotencyKey: randomUUID(),
        locationId: appLocationId,
        amountMoney: {
            amount: totalAmount.toString(),
            currency: "USD",
        },
    });

    // Here you would typically update your database to mark the quote as 'paid'
    // and store the transaction ID from result.payment.id

    return NextResponse.json({ success: true, payment: result.payment });
  } catch (error: any) {
    console.error('Square payment error:', error);
    const errorMessage = error?.errors?.[0]?.detail || "An unexpected error occurred during payment.";
    return NextResponse.json({ success: false, details: errorMessage }, { status: 500 });
  }
}
