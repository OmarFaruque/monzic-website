
import { NextRequest, NextResponse } from "next/server";
import { getPaddleApiKey, getPaddleEnvironment, getPaddleInstance, getPaddleProductId, updatePaddleProductId } from "@/lib/paddle";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { docData, user, tip, discount } = await req.json();

  if (!docData) {
    return NextResponse.json({ error: "Document data is required." }, { status: 400 });
  }

  try {
    const paddle = await getPaddleInstance();
    const apiKey = await getPaddleApiKey();
    const environment = await getPaddleEnvironment();
    const paddleApiUrl = environment === 'production'
      ? 'https://api.paddle.com'
      : 'https://sandbox-api.paddle.com';

    // Fetch site name from settings
    const generalSettings = await db.query.settings.findFirst({
      where: eq(settings.param, 'general')
    });
    let siteName = "";
    if (generalSettings && generalSettings.value) {
      const parsedSettings = JSON.parse(generalSettings.value);
      siteName = parsedSettings.siteName || "";
    }

    // Use a specific product ID for AI documents, or create a new product
    const productName = `${siteName} AI Docs`;
    let product;
    // For simplicity, we'll create a new product each time for now.
    // A better approach would be to store and reuse a product ID for "AI Generated Document".
    const createProductResponse = await fetch(`${paddleApiUrl}/products`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: productName,
        tax_category: "standard",
      }),
    });
    const createProductData = await createProductResponse.json();
    product = createProductData.data;

    const finalAmount = docData.price + (tip || 0) - (discount || 0);

    // Create a one-time price for the document
    const createPriceResponse = await fetch(`${paddleApiUrl}/prices`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: product.id,
        description: "One-time payment for AI Generated Document",
        billing_cycle: null,
        trial_period: null,
        tax_mode: "account_setting",
        unit_price: {
          amount: Math.round(finalAmount * 100).toString(),
          currency_code: "GBP",
        },
        custom_data: {
          document_details: JSON.stringify(docData),
          user_details: JSON.stringify(user),
        }
      }),
    });
    const createPriceData = await createPriceResponse.json();
    const price = createPriceData.data;

    if (price.id) {
      return NextResponse.json({ priceId: price.id, customer: user });
    } else {
      console.error("Paddle price ID not found in price:", price);
      return NextResponse.json({ error: "Failed to create Paddle price." }, { status: 500 });
    }
  } catch (error) {
    console.error("Paddle transaction creation failed:", error);
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'detail' in error) {
      errorMessage = (error as any).detail;
    }
    return NextResponse.json({ error: "Failed to create Paddle transaction.", details: errorMessage }, { status: 500 });
  }
}
