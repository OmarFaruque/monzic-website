import { NextResponse } from "next/server"
import { createMollieClient } from "@mollie/api-client"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const id = formData.get("id")?.toString()

    if (!id) {
      return NextResponse.json({ error: "Missing payment ID" }, { status: 400 })
    }

    // Initialize Mollie client
    const mollieClient = createMollieClient({
      apiKey: process.env.MOLLIE_API_KEY || "",
    })

    // Get payment details
    const payment = await mollieClient.payments.get(id)

    // Process payment status
    if (payment.isPaid()) {
      // Payment is paid, update your database
      console.log("Payment completed:", payment.id)

      // Here you would typically:
      // 1. Update order status in your database
      // 2. Create policy documents
      // 3. Send confirmation email
      // 4. Log the transaction

      // For demo purposes, we're just logging
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}
