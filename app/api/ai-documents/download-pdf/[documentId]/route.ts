
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiDocuments, settings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { generateAiDocumentPdf } from "@/lib/ai-document-pdf";

export async function GET(
  req: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const documentId = params.documentId;

    const document = await db
      .select()
      .from(aiDocuments)
      .where(eq(aiDocuments.uuid, documentId))
      .limit(1);

    if (document.length === 0) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const generalSettings = await db.query.settings.findFirst({ where: eq(settings.param, 'general') });
    let siteName = "Tempnow";
    let companyName = "Monzic AI";
    if (generalSettings && generalSettings.value) {
        const parsedSettings = JSON.parse(generalSettings.value as string);
        siteName = parsedSettings.siteName || "Tempnow";
        companyName = parsedSettings.companyName || "Monzic AI";
    }

    if (!document[0].prompt) {
      return NextResponse.json({ error: "Document prompt not found" }, { status: 404 });
    }
    const pdfBuffer = await generateAiDocumentPdf(document[0].prompt, document[0].content as string, siteName, companyName);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="monzic-document-${documentId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
