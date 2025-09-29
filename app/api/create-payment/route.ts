import { NextRequest, NextResponse } from "next/server";
import { getPaddleApiKey, getPaddleEnvironment, getPaddleInstance, getPaddleProductId, updatePaddleProductId } from "@/lib/paddle";

export async function POST(req: NextRequest) {
  const { quoteData, user } = await req.json();

  if (!quoteData) {
    return NextResponse.json({ error: "Quote data is required." }, { status: 400 });
  }

  try {
    const paddle = await getPaddleInstance();
    const apiKey = await getPaddleApiKey();
    const environment = await getPaddleEnvironment();
    const paddleApiUrl = environment === 'production'
      ? 'https://api.paddle.com'
      : 'https://sandbox-api.paddle.com';

    // Check if customer exists
    let customer;
    const customerResponse = await paddle.customers.list({ email: user.email });
    for await (const c of customerResponse) {
      customer = c;
      break;
    }
    if (!customer) {
      customer = await paddle.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      });
    }

    // Create an address for the customer
    const addressParts = quoteData.customerData.address.split(',');
    const first_line = addressParts[0] || '';
    const city = addressParts[1] || '';
    const postalCode = addressParts[2] || '';

    await paddle.addresses.create(customer.id, {
      first_line: first_line,
      city: city,
      postalCode: postalCode,
      countryCode: "GB", // Assuming UK for now
    });

    // Check if product exists
    let product;
    const productId = await getPaddleProductId();

    if (productId) {
        const productResponse = await fetch(`${paddleApiUrl}/products/${productId}`, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
            },
        });
        if (productResponse.ok) {
            const productData = await productResponse.json();
            product = productData.data;
        }
    }

    if (!product) {
      const createProductResponse = await fetch(`${paddleApiUrl}/products`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Monzic Insurance Policy",
          tax_category: "standard",
        }),
      });
      const createProductData = await createProductResponse.json();
      product = createProductData.data;
      await updatePaddleProductId(product.id);
    }

    // Create a one-time price for the quote
    const createPriceResponse = await fetch(`${paddleApiUrl}/prices`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: product.id,
        description: "One-time payment for insurance policy",
        billing_cycle: null,
        trial_period: null,
        tax_mode: "account_setting",
        unit_price: {
          amount: Math.round(quoteData.total * 100).toString(),
          currency_code: "GBP",
        },
      }),
    });
    const createPriceData = await createPriceResponse.json();
    const price = createPriceData.data;

    // Return the price ID
    if (price.id) {
      return NextResponse.json({ priceId: price.id });
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
