import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiDocuments } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';
import { sendEmail, createAIDocumentPurchaseEmail, createAdminNotificationEmail } from "@/lib/email";
import { uuid } from "drizzle-orm/pg-core";

export async function POST(req: Request) {
  try {
    const { docDetails, userDetails, transaction } = await req.json();

    const newDocument = await db.insert(aiDocuments).values({
      uuid: uuidv4(),
      prompt: docDetails.prompt,
      content: docDetails.content,
      email: userDetails.email,
      userId: userDetails.id,
      amount: docDetails.price,
      status: 'paid',
    }).returning({ id: aiDocuments.id, uuid: aiDocuments.uuid });

    const documentId = newDocument[0].id;
    const documentUuid = newDocument[0].uuid;

    // Send email in the background
    (async () => {
      try {
        const downloadLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ai-documents/download-pdf/${documentUuid}`;
        const emailHtml = createAIDocumentPurchaseEmail(
          userDetails.firstName,
          docDetails.prompt,
          downloadLink,
        );
        const adminNotificationHtml = createAdminNotificationEmail(
          "ai_document",
          userDetails.firstName,
          userDetails.email,
          docDetails.price,
          `Document Type: ${docDetails.prompt}`,
        );

        await sendEmail({
          to: userDetails.email,
          subject: "Your AI Document is Ready - MONZIC",
          html: emailHtml,
        });

        await sendEmail({
          to: process.env.ADMIN_EMAIL || "admin@monzic.com",
          subject: `New Purchase Alert - AI Document`,
          html: adminNotificationHtml,
        });
      } catch (emailError) {
        console.error("Error sending email in background:", emailError);
      }
    })();

    return NextResponse.json({ success: true, documentId });

  } catch (error) {
    console.error("Error saving document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}