import { type NextRequest, NextResponse } from "next/server"
import { sendEmail, createAIDocumentPurchaseEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { orderNumber, documentType, customerEmail, documentContent } = await request.json()

    if (!orderNumber || !customerEmail || !documentContent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create download link (in a real app, this would be a secure temporary link)
    const downloadLink = `${process.env.NEXT_PUBLIC_BASE_URL || "https://monzic.co.uk"}/download/${orderNumber}`

    // Send confirmation email
    const emailResult = await sendEmail({
      to: customerEmail,
      subject: `Your AI Document is Ready - Order ${orderNumber}`,
      html: createAIDocumentPurchaseEmail(
        customerEmail.split("@")[0], // Use email prefix as name for demo
        documentType,
        downloadLink,
      ),
    })

    if (emailResult.success) {
      // In a real app, you would also:
      // 1. Save the order to database
      // 2. Generate and store the PDF
      // 3. Create a secure download link
      // 4. Log the transaction

      return NextResponse.json({
        success: true,
        message: "Confirmation email sent successfully",
        orderNumber,
      })
    } else {
      return NextResponse.json({ error: "Failed to send confirmation email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error sending AI document email:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
