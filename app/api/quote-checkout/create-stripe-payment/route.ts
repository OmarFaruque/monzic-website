import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { users, quotes } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { settings } from "@/lib/schema";

export async function POST(req: NextRequest) {
  const { quoteData, user } = await req.json();

  if (!quoteData) {
    return NextResponse.json({ error: "Quote data is required." }, { status: 400 });
  }

  try {
    // Fetch the Stripe settings from the database
    const stripeSettings = await db.select().from(settings).where(eq(settings.param, 'stripe')).limit(1);

    if (!stripeSettings || stripeSettings.length === 0) {
      return NextResponse.json({ error: "Stripe settings not found." }, { status: 500 });
    }

    const stripeConfig = JSON.parse(stripeSettings[0].value);
    const stripeSecretKey = stripeConfig.secretKey;

    if (!stripeSecretKey) {
      return NextResponse.json({ error: "Stripe secret key not found in settings." }, { status: 500 });
    }

    // Fetch site name from settings
    const generalSettings = await db.query.settings.findFirst({
      where: eq(settings.param, 'general')
    });
    let siteName = "";
    if (generalSettings && generalSettings.value) {
      const parsedSettings = JSON.parse(generalSettings.value);
      siteName = parsedSettings.siteName || "";
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-04-10",
    });

    let stripeCustomerId = user.stripeCustomerId;

  

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({ email: user.email });
      stripeCustomerId = customer.id;
      await db.update(users).set({ stripeCustomerId }).where(eq(users.userId, user.id));
    }

    const finalAmount = quoteData.total;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100),
      currency: "gbp",
      customer: stripeCustomerId,
      description: `${siteName} Docs: Policy ${quoteData.id}`,
      metadata: {
        type: 'quote',
        quote_id: quoteData.id, // Assuming quoteData has an id
        user_details: JSON.stringify(user),
      },
    });

    // Here you would typically update the quote in your database with the paymentIntent.id
    // For example:
    await db.update(quotes).set({ paymentIntentId: paymentIntent.id }).where(eq(quotes.id, quoteData.id));

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe payment intent creation failed:", error);
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: "Failed to create Stripe payment intent.", details: errorMessage }, { status: 500 });
  }
}