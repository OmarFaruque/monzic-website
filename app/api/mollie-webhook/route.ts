import { NextRequest, NextResponse } from "next/server";
import { getMollieClient } from "@/lib/mollie";
import { db } from "@/lib/db";
import { aiDocuments, quotes } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { sendEmail, createAIDocumentPurchaseEmail, createAdminNotificationEmail, getAdminEmail } from "@/lib/email";

interface PaymentMetadata {
  type: 'ai-document' | 'quote';
  documentId?: string;
  policyNumber?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const id = formData.get("id")?.toString();

    if (!id) {
      return NextResponse.json({ error: "Missing payment ID" }, { status: 400 });
    }

    const mollie = await getMollieClient();
    const payment = await mollie.payments.get(id);

    if (payment.status === 'paid') {
      const metadata = payment.metadata as PaymentMetadata;

      if (metadata.type === 'ai-document') {
        const updatedDocs = await db.update(aiDocuments)
          .set({
            status: 'paid',
          })
          .where(and(eq(aiDocuments.id, metadata.documentId!), eq(aiDocuments.status, 'pending')))
          .returning();

          // Ensure we found a document and it hasn't been processed already
          if (updatedDocs.length > 0) {
            const doc = updatedDocs[0];

            (async () => {
              try {
                const downloadLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ai-documents/download-pdf/${doc.uuid}`;
                const emailHtml = createAIDocumentPurchaseEmail(
                  doc.email.split('@')[0], // Using part of email as a placeholder for first name
                  doc.prompt,
                  downloadLink,
                );
                const adminNotificationHtml = createAdminNotificationEmail(
                  "ai_document",
                  doc.email.split('@')[0],
                  doc.email,
                  parseFloat(doc.amount as string),
                  `Document Type: ${doc.prompt}`,
                );
        
                await sendEmail({
                  to: doc.email,
                  subject: "Your AI Document is Ready - TEMPNOW",
                  html: emailHtml,
                });
        
                const adminEmail = await getAdminEmail();
                await sendEmail({
                  to: adminEmail,
                  subject: `New Purchase Alert - AI Document`,
                  html: adminNotificationHtml,
                });
              } catch (emailError) {
                console.error("Error sending email in background:", emailError);
              }
            })();
          }

      } else if (metadata.type === 'quote') {
        const updateTimestamp = new Date().toISOString();
        const updatedQuotes = await db.update(quotes)
          .set({
            paymentStatus: 'paid',
            status: 'completed',
            mailSent: false, // Will be set to true by the confirmation sender
            paymentMethod: 'mollie',
            paymentIntentId: payment.id,
            paymentDate: updateTimestamp,
            updatedAt: updateTimestamp,
          })
          .where(eq(quotes.policyNumber, metadata.policyNumber))
          .returning({ id: quotes.id });

        if (updatedQuotes.length > 0) {
          const quoteId = updatedQuotes[0].id;
          // Trigger the email sending API without awaiting the response (fire-and-forget)
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quoteId }),
          });
        } else {
          console.error(`Webhook Error: Could not find quote with policy number ${metadata.policyNumber} to update.`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}