// Paddle configuration
const PADDLE_VENDOR_ID = process.env.PADDLE_VENDOR_ID
const PADDLE_API_KEY = process.env.PADDLE_API_KEY
const PADDLE_PUBLIC_KEY = process.env.NEXT_PUBLIC_PADDLE_PUBLIC_KEY
const PADDLE_ENVIRONMENT = process.env.PADDLE_ENVIRONMENT || "sandbox" // 'sandbox' or 'production'

export interface PaddleCheckoutData {
  productId: string
  amount: number
  currency: string
  customerEmail: string
  customerName: string
  successUrl: string
  cancelUrl: string
  metadata: Record<string, any>
}

export interface PaddlePaymentResult {
  success: boolean
  checkoutId?: string
  paymentId?: string
  transactionId?: string
  error?: string
  receiptUrl?: string
}

// Initialize Paddle checkout
export function initializePaddleCheckout(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Paddle can only be initialized in browser"))
      return
    }

    // Load Paddle script if not already loaded
    if (!window.Paddle) {
      const script = document.createElement("script")
      script.src =
        PADDLE_ENVIRONMENT === "production"
          ? "https://cdn.paddle.com/paddle/paddle.js"
          : "https://cdn.paddle.com/paddle/v2/paddle.js"

      script.onload = () => {
        window.Paddle.Environment.set(PADDLE_ENVIRONMENT)
        window.Paddle.Setup({
          vendor: Number.parseInt(PADDLE_VENDOR_ID || "0"),
          eventCallback: handlePaddleEvent,
        })
        resolve()
      }

      script.onerror = () => reject(new Error("Failed to load Paddle script"))
      document.head.appendChild(script)
    } else {
      resolve()
    }
  })
}

// Handle Paddle events
function handlePaddleEvent(data: any) {
  console.log("Paddle Event:", data)

  switch (data.event) {
    case "Checkout.Complete":
      handlePaymentSuccess(data)
      break
    case "Checkout.Close":
      handleCheckoutClose(data)
      break
    case "Checkout.Error":
      handlePaymentError(data)
      break
  }
}

function handlePaymentSuccess(data: any) {
  // Store payment success data
  sessionStorage.setItem("paddle_payment_success", JSON.stringify(data))

  // Redirect to success page
  window.location.href = "/payment-confirmation"
}

function handleCheckoutClose(data: any) {
  console.log("Checkout closed:", data)
}

function handlePaymentError(data: any) {
  console.error("Payment error:", data)

  // Store error data
  sessionStorage.setItem("paddle_payment_error", JSON.stringify(data))

  // Redirect to error page
  window.location.href = "/payment-failed"
}

// Create Paddle checkout
export async function createPaddleCheckout(checkoutData: PaddleCheckoutData): Promise<PaddlePaymentResult> {
  try {
    await initializePaddleCheckout()

    const checkoutConfig = {
      product: checkoutData.productId,
      price: checkoutData.amount,
      title: "MONZIC Insurance Policy",
      message: `Policy for ${checkoutData.metadata.vehicleDetails || "vehicle"}`,
      email: checkoutData.customerEmail,
      country: "GB",
      postcode: checkoutData.metadata.postcode || "",
      successCallback: checkoutData.successUrl,
      closeCallback: checkoutData.cancelUrl,
      loadCallback: () => {
        console.log("Paddle checkout loaded")
      },
      frameTarget: "checkout-container",
      frameInitialHeight: 450,
      frameStyle: "width:100%; min-width:312px; background-color: transparent; border: none;",
      displayModeTheme: "light",
      locale: "en",
      allowQuantity: false,
      disableLogout: true,
      passthrough: JSON.stringify(checkoutData.metadata),
    }

    window.Paddle.Checkout.open(checkoutConfig)

    return {
      success: true,
      checkoutId: "paddle_checkout_" + Date.now(),
    }
  } catch (error) {
    console.error("Paddle checkout error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Verify payment with Paddle API
export async function verifyPaddlePayment(transactionId: string): Promise<PaddlePaymentResult> {
  try {
    const response = await fetch("/api/paddle/verify-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transactionId }),
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Payment verification error:", error)
    return {
      success: false,
      error: "Payment verification failed",
    }
  }
}

// Generate payment receipt
export interface PaymentReceipt {
  id: string
  transactionId: string
  amount: number
  currency: string
  customerEmail: string
  customerName: string
  policyNumber: string
  vehicleDetails: string
  coveragePeriod: string
  paymentDate: string
  receiptUrl: string
}

export function generatePaymentReceipt(paymentData: any, policyData: any): PaymentReceipt {
  const receiptId = "RCP-" + Math.floor(100000 + Math.random() * 900000)

  return {
    id: receiptId,
    transactionId: paymentData.transactionId,
    amount: paymentData.amount,
    currency: paymentData.currency || "GBP",
    customerEmail: paymentData.customerEmail,
    customerName: paymentData.customerName,
    policyNumber: policyData.policyNumber,
    vehicleDetails: `${policyData.vehicle.year} ${policyData.vehicle.make} ${policyData.vehicle.model}`,
    coveragePeriod: `${policyData.startTime} - ${policyData.expiryTime}`,
    paymentDate: new Date().toISOString(),
    receiptUrl: `/receipts/${receiptId}`,
  }
}

// Fraud detection helpers
export function detectSuspiciousActivity(paymentData: any, userHistory: any[]): boolean {
  // Check for multiple failed payments
  const recentFailures = userHistory.filter(
    (h) => h.type === "payment_failed" && Date.now() - new Date(h.timestamp).getTime() < 24 * 60 * 60 * 1000,
  ).length

  if (recentFailures > 3) {
    return true
  }

  // Check for unusual amounts
  if (paymentData.amount > 1000 || paymentData.amount < 5) {
    return true
  }

  // Check for suspicious email patterns
  const suspiciousEmailPatterns = [/temp.*mail/i, /10.*minute.*mail/i, /guerrilla.*mail/i, /mailinator/i]

  if (suspiciousEmailPatterns.some((pattern) => pattern.test(paymentData.customerEmail))) {
    return true
  }

  return false
}

// Declare Paddle types for TypeScript
declare global {
  interface Window {
    Paddle: {
      Environment: {
        set: (env: string) => void
      }
      Setup: (config: any) => void
      Checkout: {
        open: (config: any) => void
        close: () => void
      }
    }
  }
}
