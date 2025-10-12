import { NextRequest, NextResponse } from "next/server";
import { getMollieClient } from "@/lib/mollie";
import { getPaddleInstance, getPaddleApiKey, getPaddleEnvironment, getPaddleProductId, updatePaddleProductId } from "@/lib/paddle";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';
import { settings, aiDocuments, quotes } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { quoteData, docData, user, tip, discount } = await req.json();
  
  if (!user) {
    return NextResponse.json({ error: "User data is required." }, { status: 400 });
  }

  const paymentSettings = await db.query.settings.findFirst({
    where: eq(settings.param, 'payment'),
  });

  const activeProvider = paymentSettings ? JSON.parse(paymentSettings.value as string).activeProcessor : 'stripe';

  if (activeProvider === 'mollie') {
    try {
      const mollie = await getMollieClient();
      let amount;
      let description;
      let metadata;
      let redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment-confirmation`;

      if (docData) {
        const amountValue = docData.price + (tip || 0) - (discount || 0);
        amount = amountValue.toFixed(2);
        redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/ai-payment-confirmation`;
        description = `AI Document: ${docData.prompt.substring(0, 50)}...`;
        
        const newDocument = await db.insert(aiDocuments).values({
          uuid: uuidv4(),
          prompt: docData.prompt,
          content: docData.content,
          email: user.email,
          userId: user.id,
          status: 'pending',
          amount: amount,
          currency: 'GBP',
        }).returning({ id: aiDocuments.id });

        metadata = { type: 'ai-document', documentId: newDocument[0].id };

      } else if (quoteData) {
        const amountValue = quoteData.total - (discount || 0);
        amount = amountValue.toFixed(2);
        description = `Insurance Quote: ${quoteData.policyNumber}`;
        metadata = { type: 'quote', policyNumber: quoteData.policyNumber };
      } else {
        return NextResponse.json({ error: "No document or quote data provided." }, { status: 400 });
      }

      const payment = await mollie.payments.create({
        amount: {
          currency: "GBP",
          value: amount,
        },
        description: description,
        redirectUrl: redirectUrl,
        webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mollie-webhook`,
        metadata: metadata,
      });

      return NextResponse.json({ checkoutUrl: payment.getCheckoutUrl() });
    } catch (error) {
      console.error("Mollie payment creation failed:", error);
      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return NextResponse.json({ error: "Failed to create Mollie payment.", details: errorMessage }, { status: 500 });
    }
  } else if (activeProvider === 'paddle') {
    try {
        const paddle = await getPaddleInstance();
        const apiKey = await getPaddleApiKey();
        const environment = await getPaddleEnvironment();
        const paddleApiUrl = environment === 'production'
          ? 'https://api.paddle.com'
          : 'https://sandbox-api.paddle.com';

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
              name: docData ? "AI Document" : "Monzic Insurance Policy",
              tax_category: "standard",
            }),
          });
          const createProductData = await createProductResponse.json();
          product = createProductData.data;
          await updatePaddleProductId(product.id);
        }

        const amount = docData ? (docData.price + (tip || 0) - (discount || 0)) * 100 : (quoteData.total - (discount || 0)) * 100;
        const description = docData ? `AI Document: ${docData.prompt.substring(0, 50)}...` : "One-time payment for insurance policy";
        const custom_data = docData ? { doc_details: JSON.stringify(docData), user_details: JSON.stringify(user) } : { quote_details: JSON.stringify(quoteData), user_details: JSON.stringify(user) };

        const createPriceResponse = await fetch(`${paddleApiUrl}/prices`, {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: product.id,
            description: description,
            billing_cycle: null,
            trial_period: null,
            tax_mode: "account_setting",
            unit_price: {
              amount: Math.round(amount).toString(),
              currency_code: "GBP",
            },
            custom_data: custom_data,
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
  } else {
    return NextResponse.json({ error: "Invalid payment provider." }, { status: 400 });
  }
}