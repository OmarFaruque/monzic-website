import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateInvoicePdf(quoteData: any, user: any) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = 12;
  const smallFontSize = 10;
  const x = 50;
  let y = height - 50;

  page.drawText('Tax Invoice', { x, y, font: boldFont, size: 24 });
  y -= 50;

  page.drawText(`Invoice #: ${quoteData.id}`, { x, y, font, size: fontSize });
  y -= 20;
  page.drawText(`Date: ${new Date().toLocaleDateString()}`, { x, y, font, size: fontSize });
  y -= 40;

  page.drawText('Bill To:', { x, y, font: boldFont, size: fontSize });
  y -= 20;
  page.drawText(`${user.firstName} ${user.lastName}`, { x, y, font, size: fontSize });
  y -= 15;
  page.drawText(user.email, { x, y, font, size: fontSize });
  y -= 15;
  page.drawText(quoteData.customerData.address, { x, y, font, size: fontSize });
  y -= 40;

  // Table Header
  page.drawText('Description', { x, y, font: boldFont, size: fontSize });
  page.drawText('Amount', { x: width - 150, y, font: boldFont, size: fontSize });
  y -= 25;

  // Line item
  const vehicle = quoteData.customerData.vehicle;
  const description = `Temporary Insurance - ${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  page.drawText(description, { x, y, font, size: fontSize });
  page.drawText(`£${quoteData.total.toFixed(2)}`, { x: width - 150, y, font, size: fontSize });
  y -= 30;

  // Total
  page.drawText('Total', { x: width - 250, y, font: boldFont, size: fontSize });
  page.drawText(`£${quoteData.total.toFixed(2)}`, { x: width - 150, y, font: boldFont, size: fontSize });
  y -= 40;

  page.drawText('Thank you for your business!', { x, y, font, size: fontSize });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
