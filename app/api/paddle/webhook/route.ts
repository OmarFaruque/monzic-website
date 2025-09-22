import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("paddle-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    // Verify webhook signature
    const publicKey = process.env.PADDLE_WEBHOOK_PUBLIC_KEY
    if (!publicKey) {
      console.error("Missing Paddle webhook public key")
      return NextResponse.json({ error: "Configuration error" }, { status: 500 })
    }

    // Verify signature (simplified - in production use proper crypto verification)
    const expectedSignature = crypto.createHmac("sha256", publicKey).update(body).digest("hex")

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const webhookData = JSON.parse(body)

    // Handle different webhook events
    switch (webhookData.alert_name) {
      case "payment_succeeded":
        await handlePaymentSucceeded(webhookData)
        break
      case "payment_failed":
        await handlePaymentFailed(webhookData)
        break
      case "payment_refunded":
        await handlePaymentRefunded(webhookData)
        break
      default:
        console.log("Unhandled webhook event:", webhookData.alert_name)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handlePaymentSucceeded(data: any) {
  console.log("Payment succeeded:", data)

  // TODO: Update database with payment success
  // TODO: Generate policy document
  // TODO: Send confirmation email
  // TODO: Log audit event
}

async function handlePaymentFailed(data: any) {
  console.log("Payment failed:", data)

  // TODO: Update database with payment failure
  // TODO: Send failure notification
  // TODO: Log audit event
}

async function handlePaymentRefunded(data: any) {
  console.log("Payment refunded:", data)

  // TODO: Update database with refund
  // TODO: Cancel policy if applicable
  // TODO: Send refund notification
  // TODO: Log audit event
}
