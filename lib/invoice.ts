import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateInvoicePdf(quoteData: any, user: any) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = 12;
  const x = 50;
  let y = height - 50;

  // 1. Change Title
  page.drawText('Invoice', { x, y, font: boldFont, size: 24, color: rgb(0, 0, 0) });
  y -= 50;

  page.drawText(`Invoice #: ${quoteData.id}`, { x, y, font, size: fontSize });
  y -= 20;
  const invoiceDate = quoteData.paymentDate ? new Date(quoteData.paymentDate) : new Date();
  page.drawText(`Date: ${invoiceDate.toLocaleDateString()}`, { x, y, font, size: fontSize });
  y -= 40;

  page.drawText('Bill To:', { x, y, font: boldFont, size: fontSize });
  y -= 20;
  page.drawText(`${quoteData.customerData.firstName} ${quoteData.customerData.lastName}`, { x, y, font, size: fontSize });
  y -= 15;
  page.drawText(user.email, { x, y, font, size: fontSize });
  y -= 15;
  page.drawText(quoteData.customerData.address, { x, y, font, size: fontSize });
  y -= 40;

  // 3. Improve UI (Table with borders)
  const table = {
    x: x,
    y: y,
    width: width - 100,
    headerHeight: 25,
    rowHeight: 25,
    col1Width: width - 250, // Adjusted width for description
  };
  table.col2Width = table.width - table.col1Width;

  // Draw Header
  page.drawRectangle({
    x: table.x,
    y: table.y - table.headerHeight,
    width: table.width,
    height: table.headerHeight,
    color: rgb(0.92, 0.92, 0.92), // Lighter grey
  });
  page.drawText('Description', { x: table.x + 10, y: table.y - 17, font: boldFont, size: fontSize });
  page.drawText('Amount', { x: table.x + table.col1Width + 10, y: table.y - 17, font: boldFont, size: fontSize });

  y -= table.headerHeight;

  // 2. Fix vehicle.year & Draw Row
  const vehicle = quoteData.customerData.vehicle;
  const yearString = vehicle.year && String(vehicle.year).toLowerCase() !== 'unknown' ? `${vehicle.year} ` : '';
  const description = `Temporary Insurance - ${yearString}${vehicle.make} ${vehicle.model}`;

  page.drawText(description, { x: table.x + 10, y: y - 17, font, size: fontSize });
  page.drawText(`£${quoteData.total.toFixed(2)}`, { x: table.x + table.col1Width + 10, y: y - 17, font, size: fontSize });

  y -= table.rowHeight;

  // Draw table borders
  page.drawRectangle({
      x: table.x,
      y: y,
      width: table.width,
      height: table.headerHeight + table.rowHeight,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
  });

  // Draw vertical line
  page.drawLine({
      start: { x: table.x + table.col1Width, y: table.y },
      end: { x: table.x + table.col1Width, y: y },
      color: rgb(0.8, 0.8, 0.8),
      thickness: 1
  });

  y -= 20; // space after table

  // Total section
  const totalX = table.x + table.col1Width;
  const totalLabelX = totalX + 10;
  const totalValueX = totalX + table.col2Width - 90;

  page.drawText('Total', { x: totalLabelX, y: y - 17, font: boldFont, size: fontSize });
  page.drawText(`£${quoteData.total.toFixed(2)}`, { x: totalValueX, y: y - 17, font: boldFont, size: 14 });
  
  y -= 40;

  page.drawText('Thank you for your business!', { x: x, y: y, font, size: fontSize });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}