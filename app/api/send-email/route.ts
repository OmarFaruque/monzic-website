import { type NextRequest, NextResponse } from "next/server"
import {
  sendEmail,
  createAIDocumentPurchaseEmail,
  createInsurancePolicyEmail,
  createAdminNotificationEmail,
} from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, customerData, purchaseData } = body

    let emailHtml = ""
    let subject = ""
    let adminNotificationHtml = ""

    switch (type) {
      case "ai_document":
        subject = "Your AI Document is Ready - MONZIC"
        emailHtml = createAIDocumentPurchaseEmail(
          customerData.name,
          purchaseData.documentType,
          purchaseData.downloadLink,
        )
        adminNotificationHtml = createAdminNotificationEmail(
          "ai_document",
          customerData.name,
          customerData.email,
          purchaseData.amount,
          `Document Type: ${purchaseData.documentType}`,
        )
        break

      case "insurance_policy":
        subject = "Insurance Policy Confirmation - MONZIC"
        emailHtml = createInsurancePolicyEmail(
          customerData.name,
          purchaseData.policyNumber,
          purchaseData.vehicleDetails,
          purchaseData.startDate,
          purchaseData.endDate,
          purchaseData.amount,
          purchaseData.policyDocumentLink,
        )
        adminNotificationHtml = createAdminNotificationEmail(
          "insurance_policy",
          customerData.name,
          customerData.email,
          purchaseData.amount,
          `Policy: ${purchaseData.policyNumber}, Vehicle: ${purchaseData.vehicleDetails}`,
        )
        break

      default:
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 })
    }

    // Send customer email
    const customerEmailResult = await sendEmail({
      to: customerData.email,
      subject,
      html: emailHtml,
    })

    // Send admin notification
    const adminEmailResult = await sendEmail({
      to: process.env.ADMIN_EMAIL || "admin@monzic.com",
      subject: `New Purchase Alert - ${type === "ai_document" ? "AI Document" : "Insurance Policy"}`,
      html: adminNotificationHtml,
    })

    if (customerEmailResult.success) {
      return NextResponse.json({
        success: true,
        message: "Emails sent successfully",
        customerEmail: customerEmailResult.data,
        adminEmail: adminEmailResult.data,
      })
    } else {
      return NextResponse.json(
        {
          error: "Failed to send customer email",
          details: customerEmailResult.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Email API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

