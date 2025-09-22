import { NextResponse } from "next/server"
import { createMollieClient } from "@mollie/api-client"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, description, redirectUrl, webhookUrl, metadata } = body

    if (!amount || !description || !redirectUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Initialize Mollie client
    const mollieClient = createMollieClient({
      apiKey: process.env.MOLLIE_API_KEY || "",
    })

    // Create payment
    const payment = await mollieClient.payments.create({
      amount: {
        currency: "GBP",
        value: amount.toFixed(2), // Format as string with 2 decimal places
      },
      description,
      redirectUrl,
      webhookUrl: webhookUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/api/mollie-webhook`,
      metadata,
    })

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      checkoutUrl: payment.getCheckoutUrl(),
    })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
