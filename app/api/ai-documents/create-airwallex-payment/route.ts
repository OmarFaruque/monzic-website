
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { docData, user, tip, discount } = await req.json();

  if (!docData) {
    return NextResponse.json({ error: "Document data is required." }, { status: 400 });
  }

  try {
    const airwallexSettings = await db.select().from(settings).where(eq(settings.param, 'airwallex')).limit(1);

    if (!airwallexSettings || airwallexSettings.length === 0) {
      return NextResponse.json({ error: "Airwallex settings not found." }, { status: 500 });
    }

    const airwallexConfig = JSON.parse(airwallexSettings[0].value);
    const clientId = airwallexConfig.client_id;
    const apiKey = airwallexConfig.apikey;
    const environment = airwallexConfig.environment;
    const baseUrl = environment === 'test' ? 'https://api-demo.airwallex.com' : 'https://api.airwallex.com';

    if (!clientId || !apiKey) {
      return NextResponse.json({ error: "Airwallex client ID or API key not found in settings." }, { status: 500 });
    }

    const airwallexAuthResponse = await fetch(`${baseUrl}/api/v1/authentication/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': clientId,
        'x-api-key': apiKey
      }
    });

    const authData = await airwallexAuthResponse.json();

    const token = authData.token;

    if (!token) {
      return NextResponse.json({ error: "Failed to authenticate with Airwallex." }, { status: 500 });
    }

    const finalAmount = docData.price + (tip || 0) - (discount || 0);
    const limitedPrompt = docData.prompt.substring(0, 200);

    // Fetch site name from settings
    const generalSettings = await db.query.settings.findFirst({
      where: eq(settings.param, 'general')
    });
    let siteName = "";
    if (generalSettings && generalSettings.value) {
      const parsedSettings = JSON.parse(generalSettings.value);
      siteName = parsedSettings.siteName || "";
    }

    const paymentIntentResponse = await fetch(`${baseUrl}/api/v1/pa/payment_intents/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        request_id: crypto.randomUUID(),
        amount: finalAmount,
        currency: "GBP",
        merchant_order_id: crypto.randomUUID(),
        description: `${siteName} AI Docs: ${limitedPrompt}`,
        metadata: {
          type: 'ai_document',
          document_details: JSON.stringify({
            prompt: limitedPrompt,
            content: docData.content, // Add content to metadata
            price: docData.price,
          }),
          user_details: JSON.stringify(user),
        },
      })
    });

    if (!paymentIntentResponse.ok) {
      const errorBody = await paymentIntentResponse.json();
      console.error("Airwallex payment intent creation failed:", errorBody);
      return NextResponse.json({ error: "Failed to create Airwallex payment intent.", details: errorBody }, { status: 500 });
    }

    const paymentIntent = await paymentIntentResponse.json();

    if (!paymentIntent || !paymentIntent.id || !paymentIntent.client_secret) {
        console.error("Invalid payment intent response from Airwallex:", paymentIntent);
        return NextResponse.json({ error: "Invalid payment intent response from Airwallex." }, { status: 500 });
    }

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, intentId: paymentIntent.id });
  } catch (error) {
    console.error("Airwallex payment intent creation failed:", error);
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: "Failed to create Airwallex payment intent.", details: errorMessage }, { status: 500 });
  }
}
