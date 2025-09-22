import { type NextRequest, NextResponse } from "next/server"
import { isGeneralRateLimited } from "@/lib/auth"

export async function POST(request: NextRequest) {
  // Rate limiting
  if (isGeneralRateLimited(request)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const { transactionId } = await request.json()

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 })
    }

    // In a real implementation, verify with Paddle API
    const paddleResponse = await fetch(`https://vendors.paddle.com/api/2.0/payment/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        vendor_id: process.env.PADDLE_VENDOR_ID || "",
        vendor_auth_code: process.env.PADDLE_API_KEY || "",
        order_id: transactionId,
      }),
    })

    if (!paddleResponse.ok) {
      throw new Error("Paddle API error")
    }

    const paddleData = await paddleResponse.json()

    // For demo purposes, return success
    return NextResponse.json({
      success: true,
      transactionId,
      paymentId: paddleData.payment_id || "demo_payment_" + Date.now(),
      receiptUrl: `/receipts/${transactionId}`,
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 500 })
  }
}
