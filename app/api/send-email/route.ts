import { type NextRequest, NextResponse } from "next/server";
import {
  sendEmail,
  createAIDocumentPurchaseEmail,
  createInsurancePolicyEmail,
  createAdminNotificationEmail,
  createDirectEmail,
  getAdminEmail,
} from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { type, customerData, purchaseData } = body;

      let emailData;
      let adminEmailData;

      switch (type) {
        case "ai_document":
          emailData = await createAIDocumentPurchaseEmail(
            customerData.firstName,
            customerData.lastName,
            purchaseData.orderId,
            new Date().toLocaleDateString(),
            purchaseData.amount,
            purchaseData.documentType,
            purchaseData.downloadLink,
          );
          adminEmailData = await createAdminNotificationEmail(
            "ai_document",
            customerData.name,
            customerData.email,
            purchaseData.amount,
            `Document Type: ${purchaseData.documentType}`,
          );
          break;

        case "insurance_policy":
          emailData = await createInsurancePolicyEmail(
            customerData.firstName,
            customerData.lastName,
            purchaseData.policyNumber,
            purchaseData.vehicleReg,
            purchaseData.vehicleMake,
            purchaseData.vehicleModel,
            purchaseData.vehicleYear,
            purchaseData.startDate,
            purchaseData.endDate,
            purchaseData.amount,
            purchaseData.policyDocumentLink,
          );
          adminEmailData = await createAdminNotificationEmail(
            "insurance_policy",
            customerData.name,
            customerData.email,
            purchaseData.amount,
            `Policy: ${purchaseData.policyNumber}, Vehicle: ${purchaseData.vehicleDetails}`,
          );
          break;

        default:
          return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
      }

      if (emailData) {

        await sendEmail({
          to: customerData.email,
          subject: emailData.subject,
          html: emailData.html,
        });
      }

      if (adminEmailData) {
        const adminEmail = await getAdminEmail();
        await sendEmail({
          to: adminEmail,
          subject: adminEmailData.subject,
          html: adminEmailData.html,
        });
      }

      return NextResponse.json({ success: true, message: "Emails sent successfully" });
    
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const to = formData.get('to') as string;
      const subject = formData.get('subject') as string;
      const message = (formData.get('html') || formData.get('message')) as string;
      const attachments = formData.getAll('attachments') as File[];

      if (!to || !subject || !message) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const processedAttachments = [];
      for (const file of attachments) {
        const buffer = Buffer.from(await file.arrayBuffer());
        processedAttachments.push({ filename: file.name, content: buffer });
      }

      const emailData = await createDirectEmail(subject, message);

      const result = await sendEmail({
        to: to,
        subject: emailData.subject,
        html: emailData.html,
        attachments: processedAttachments,
      });

      if (result.success) {
        return NextResponse.json({ success: true, message: "Email sent successfully" });
      } else {
        return NextResponse.json({ error: "Failed to send email", details: result.error }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: `Unsupported content type: ${contentType}` }, { status: 415 });
    }
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
