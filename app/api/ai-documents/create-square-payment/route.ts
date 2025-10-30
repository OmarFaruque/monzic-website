import { NextRequest, NextResponse } from 'next/server';
import { SquareClient, SquareError, SquareEnvironment } from 'square';
import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { settings } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const squareSettingsRecord = await db.select().from(settings).where(eq(settings.param, 'square'));

    if (squareSettingsRecord.length === 0 || !squareSettingsRecord[0].value) {
      return NextResponse.json({ success: false, details: 'Square settings not found in the database.' }, { status: 500 });
    }

    const squareSettings = JSON.parse(squareSettingsRecord[0].value);
    const { accessToken, appLocationId, environment } = squareSettings;



    if (!accessToken || !appLocationId) {
      return NextResponse.json({ success: false, details: 'Square access token or location ID is not configured.' }, { status: 500 });
    }

    const squareClient = new SquareClient({
      environment: environment == 'sandbox' ? SquareEnvironment.Sandbox : SquareEnvironment.Production,
      token: accessToken
    });

    const { sourceId, docData, user, tip, discount } = await req.json();

    // Basic validation
    if (!sourceId || !docData || !user) {
        return NextResponse.json({ success: false, details: "Missing required payment information." }, { status: 400 });
    }

    const price = docData.price || 0;
    const tipAmount = tip || 0;
    const discountAmount = discount || 0;

    const amount = price - discountAmount + tipAmount;
    if (amount <= 0) {
        return NextResponse.json({ success: false, details: "Payment amount must be positive." }, { status: 400 });
    }

    const totalAmount = BigInt(Math.round(amount * 100)); // Amount in cents

    // Fetch site name from settings
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

    const payment = {
        sourceId: sourceId,
        idempotencyKey: randomUUID(),
        locationId: appLocationId,
        amountMoney: {
            amount: totalAmount,
            currency: currency
        },
        note: `${siteName} AI Docs: ${docData.prompt.substring(0, 50)}...`,
      };

    const result = await squareClient.payments.create(payment);


    


    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Square payment error:', error);
    
    let errorMessage = "An unexpected error occurred during payment.";
    if (error.errors && error.errors.length > 0) {
        errorMessage = error.errors.map((e: any) => e.detail).join(', ');
    }

    return NextResponse.json({ success: false, details: errorMessage }, { status: 500 });
  }
}
