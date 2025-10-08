import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiDocuments } from "@/lib/schema";
import { eq } from "drizzle-orm";
import puppeteer from "puppeteer";

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

    const html = document[0].content as string;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

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