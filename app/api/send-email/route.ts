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

    // Handle JSON-based transactional emails (existing functionality)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { type, customerData, purchaseData } = body;

      let emailHtml = "";
      let subject = "";
      let adminNotificationHtml = "";

      switch (type) {
        case "ai_document":
          subject = "Your AI Document is Ready - TEMPNOW";
          emailHtml = createAIDocumentPurchaseEmail(
            customerData.name,
            purchaseData.documentType,
            purchaseData.downloadLink,
          );
          adminNotificationHtml = createAdminNotificationEmail(
            "ai_document",
            customerData.name,
            customerData.email,
            purchaseData.amount,
            `Document Type: ${purchaseData.documentType}`,
          );
          break;

        case "insurance_policy":
          subject = "Insurance Policy Confirmation - TEMPNOW";
          emailHtml = await createInsurancePolicyEmail(
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
          adminNotificationHtml = createAdminNotificationEmail(
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

      // Send customer email
      await sendEmail({
        to: customerData.email,
        subject,
        html: emailHtml,
      });

      // Send admin notification
      const adminEmail = await getAdminEmail();
      await sendEmail({
        to: adminEmail,
        subject: `New Purchase Alert - ${type === "ai_document" ? "AI Document" : "Insurance Policy"}`,
        html: adminNotificationHtml,
      });

      return NextResponse.json({ success: true, message: "Emails sent successfully" });
    
    // Handle FormData-based direct emails (new functionality for tickets section)
    } else if (contentType.includes('multipart/form-data')) {

      
      const formData = await request.formData();
      const to = formData.get('to') as string;
      const subject = formData.get('subject') as string;
      const message = (formData.get('html') || formData.get('message')) as string;
      const attachments = formData.getAll('attachments') as File[];

      // console.log('inse multipart form: ', to, 'subject: ', subject, 'message: ', message, 'attachment: ', attachments)

      if (!to || !subject || !message) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      // Process attachments for the email service
      const processedAttachments = [];
      for (const file of attachments) {
        const buffer = Buffer.from(await file.arrayBuffer());
        processedAttachments.push({ filename: file.name, content: buffer });
      }

      const emailHtml = await createDirectEmail(subject, message);

      // Send the direct email
      const result = await sendEmail({
        to: to,
        subject: subject,
        html: emailHtml,
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