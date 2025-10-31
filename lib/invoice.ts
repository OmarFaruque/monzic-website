
import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';

/**
 * A robust function to split text into lines that fit within a max width.
 * This is a corrected implementation.
 */
function splitTextIntoLines(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
    const words = text.split(' ');
    if (!words.length) return [];

    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + " " + word;
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width < maxWidth) {
            currentLine = testLine;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

export async function generateInvoicePdf(quoteData: any, user: any, policyNumber: string, siteName: string) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // --- COLORS (from jspdf) ---
  const tealColor = rgb(20 / 255, 184 / 255, 166 / 255);
  const darkColor = rgb(15 / 255, 23 / 255, 42 / 255);
  const grayColor = rgb(100 / 255, 116 / 255, 139 / 255);
  const lightGrayColor = rgb(226 / 255, 232 / 255, 240 / 255);
  const lightTealBackground = rgb(248 / 255, 250 / 255, 250 / 255);

  // --- DIMENSIONS (from jspdf) ---
  const mmToPt = 2.83465;
  const margin = 20 * mmToPt;

  // --- PAGE 1: Invoice ---
  const page1 = pdfDoc.addPage();
  const { width: pageWidth, height: pageHeight } = page1.getSize();
  let yPos: number;

  // Header (y starts from top in jspdf, so we subtract from pageHeight)
  page1.drawRectangle({
    x: 0,
    y: pageHeight - (30 * mmToPt),
    width: pageWidth,
    height: 30 * mmToPt,
    color: tealColor,
  });
  const headerText = siteName.toUpperCase();
  const headerTextWidth = boldFont.widthOfTextAtSize(headerText, 24);
  page1.drawText(headerText, {
    x: (pageWidth - headerTextWidth) / 2,
    y: pageHeight - (20 * mmToPt),
    font: boldFont,
    size: 24,
    color: rgb(1, 1, 1),
  });

  yPos = pageHeight - (50 * mmToPt);

  // Invoice Title
  page1.drawText('SALES INVOICE', { x: margin, y: yPos, font: boldFont, size: 20, color: darkColor });

  // Invoice Details
  yPos -= (10 * mmToPt);
  page1.drawText(`Invoice #: ${policyNumber}`, { x: margin, y: yPos, font, size: 10, color: grayColor });
  yPos -= (5 * mmToPt);
  const invoiceDate = quoteData.paymentDate ? new Date(quoteData.paymentDate) : new Date();
  const dateStr = `${invoiceDate.toLocaleDateString("en-GB")} - ${invoiceDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
  page1.drawText(`Date: ${dateStr}`, { x: margin, y: yPos, font, size: 10, color: grayColor });

  // Invoice To and Deliver To
  yPos -= (15 * mmToPt);
  const col1X = margin;
  const col2X = pageWidth / 2 + (10 * mmToPt);
  page1.drawText('INVOICE TO', { x: col1X, y: yPos, font: boldFont, size: 9, color: tealColor });
  page1.drawText('DELIVER TO', { x: col2X, y: yPos, font: boldFont, size: 9, color: tealColor });

  yPos -= (6 * mmToPt);
  const toName = `${quoteData.customerData.firstName || ''} ${quoteData.customerData.lastName || ''}`;
  const toEmail = user.email || 'N/A';
  const toAddress = quoteData.customerData.address || 'N/A';
  page1.drawText(toName, { x: col1X, y: yPos, font: boldFont, size: 10, color: darkColor });
  page1.drawText(toName, { x: col2X, y: yPos, font: boldFont, size: 10, color: darkColor });
  yPos -= (5 * mmToPt);
  page1.drawText(toEmail, { x: col1X, y: yPos, font, size: 10, color: grayColor });
  page1.drawText(toEmail, { x: col2X, y: yPos, font, size: 10, color: grayColor });
  
  yPos -= (5 * mmToPt);
  const addressMaxWidth = 80 * mmToPt;
  const addressLines = splitTextIntoLines(toAddress, font, 10, addressMaxWidth);
  let addressStartY = yPos;
  for (const line of addressLines) {
      page1.drawText(line, { x: col1X, y: addressStartY, font, size: 10, color: grayColor });
      page1.drawText(line, { x: col2X, y: addressStartY, font, size: 10, color: grayColor });
      addressStartY -= 14; // Approx 5mm line height
  }
  yPos = addressStartY + 14 - (addressLines.length * 5 * mmToPt) - (10 * mmToPt);

  // Table Header
  page1.drawLine({ start: { x: margin, y: yPos }, end: { x: pageWidth - margin, y: yPos }, color: tealColor, thickness: 0.5 });
  yPos -= (6 * mmToPt);
  
  const rightEdge = pageWidth - margin;
  page1.drawText('DESCRIPTION', { x: margin, y: yPos, font: boldFont, size: 9, color: darkColor });
  
  let text = 'AMOUNT';
  let textWidth = boldFont.widthOfTextAtSize(text, 9);
  page1.drawText(text, { x: rightEdge - textWidth, y: yPos, font: boldFont, size: 9, color: darkColor });
  
  text = 'UNIT PRICE';
  textWidth = boldFont.widthOfTextAtSize(text, 9);
  page1.drawText(text, { x: rightEdge - (40 * mmToPt) - textWidth, y: yPos, font: boldFont, size: 9, color: darkColor });
  
  text = 'QTY';
  textWidth = boldFont.widthOfTextAtSize(text, 9);
  page1.drawText(text, { x: rightEdge - (60 * mmToPt) - textWidth, y: yPos, font: boldFont, size: 9, color: darkColor });

  yPos -= (3 * mmToPt);
  page1.drawLine({ start: { x: margin, y: yPos }, end: { x: rightEdge, y: yPos }, color: lightGrayColor, thickness: 0.5 });

  // Table Rows
  yPos -= (8 * mmToPt);
  const itemYPos = yPos;
  page1.drawText('TEMPNOW Docs', { x: margin, y: itemYPos, font: boldFont, size: 10, color: darkColor });
  
  yPos -= (5 * mmToPt);
  page1.drawText(`Document ID: ${policyNumber}`, { x: margin, y: yPos, font, size: 9, color: grayColor });

  const itemQuantity = 1;
  const itemRate = quoteData.total;
  const itemAmount = itemQuantity * itemRate;

  text = `£${(itemAmount).toFixed(2)}`;
  textWidth = boldFont.widthOfTextAtSize(text, 10);
  page1.drawText(text, { x: rightEdge - textWidth, y: itemYPos, font: boldFont, size: 10, color: darkColor });

  text = `£${itemRate.toFixed(2)}`;
  textWidth = font.widthOfTextAtSize(text, 10);
  page1.drawText(text, { x: rightEdge - (40 * mmToPt) - textWidth, y: itemYPos, font, size: 10, color: darkColor });
  
  text = itemQuantity.toString();
  textWidth = font.widthOfTextAtSize(text, 10);
  page1.drawText(text, { x: rightEdge - (60 * mmToPt) - textWidth, y: itemYPos, font, size: 10, color: darkColor });

  yPos -= (3 * mmToPt);
  page1.drawLine({ start: { x: margin, y: yPos }, end: { x: rightEdge, y: yPos }, color: lightGrayColor, thickness: 0.5 });

  // Totals
  yPos -= (15 * mmToPt);
  const totalsX = rightEdge - (60 * mmToPt);
  
  page1.drawText('Subtotal:', { x: totalsX, y: yPos, font, size: 10, color: grayColor });
  text = `£${itemAmount.toFixed(2)}`;
  textWidth = boldFont.widthOfTextAtSize(text, 10);
  page1.drawText(text, { x: rightEdge - textWidth, y: yPos, font: boldFont, size: 10, color: darkColor });

  yPos -= (10 * mmToPt);
  page1.drawLine({ start: { x: totalsX, y: yPos }, end: { x: rightEdge, y: yPos }, color: tealColor, thickness: 0.5 });

  yPos -= (8 * mmToPt);
  page1.drawText('Total:', { x: totalsX, y: yPos, font: boldFont, size: 12, color: darkColor });
  text = `£${itemAmount.toFixed(2)}`;
  textWidth = boldFont.widthOfTextAtSize(text, 12);
  page1.drawText(text, { x: rightEdge - textWidth, y: yPos, font: boldFont, size: 12, color: tealColor });

  // Footer
  yPos = 20 * mmToPt;
  page1.drawLine({ start: { x: margin, y: yPos }, end: { x: pageWidth - margin, y: yPos }, color: lightGrayColor, thickness: 0.5 });
  yPos -= (5 * mmToPt); // CORRECTED: Decrement Y to move down
  
  text = `© ${new Date().getFullYear()} ${siteName}`;
  textWidth = font.widthOfTextAtSize(text, 8);
  page1.drawText(text, { x: (pageWidth - textWidth) / 2, y: yPos, font, size: 8, color: grayColor });
  
  yPos -= (4 * mmToPt); // CORRECTED: Decrement Y to move down
  text = 'Please contact us through our website contact page for support.';
  textWidth = font.widthOfTextAtSize(text, 8);
  page1.drawText(text, { x: (pageWidth - textWidth) / 2, y: yPos, font, size: 8, color: grayColor });


  // --- PAGE 2: Instructions ---
  const page2 = pdfDoc.addPage();
  const { width: pageWidth2, height: pageHeight2 } = page2.getSize();

  // Header
  page2.drawRectangle({ x: 0, y: pageHeight2 - (30 * mmToPt), width: pageWidth2, height: 30 * mmToPt, color: tealColor });
  const headerText2 = siteName.toUpperCase();
  const headerTextWidth2 = boldFont.widthOfTextAtSize(headerText2, 24);
  page2.drawText(headerText2, { x: (pageWidth2 - headerTextWidth2) / 2, y: pageHeight2 - (20 * mmToPt), font: boldFont, size: 24, color: rgb(1, 1, 1) });

  yPos = pageHeight2 - (50 * mmToPt);

  // Title
  page2.drawText('Document Access Instructions', { x: margin, y: yPos, font: boldFont, size: 16, color: darkColor });
  yPos -= (10 * mmToPt);
  page2.drawText('You can access your documents in two ways:', { x: margin, y: yPos, font: boldFont, size: 10, color: darkColor });
  yPos -= (10 * mmToPt);

  // Option 1
  page2.drawCircle({ x: margin + (3 * mmToPt), y: yPos - (2 * mmToPt), size: 3 * mmToPt, color: tealColor });
  page2.drawText('1', { x: margin + (3 * mmToPt) - (boldFont.widthOfTextAtSize('1', 8)/2) , y: yPos - (2 * mmToPt) - 3, font: boldFont, size: 8, color: rgb(1, 1, 1) });
  page2.drawText('Account Dashboard', { x: margin + (10 * mmToPt), y: yPos, font: boldFont, size: 10, color: darkColor });
  yPos -= (5 * mmToPt);
  const text1 = 'Log in to your account and navigate to your dashboard where all your purchased documents are available for download.';
  const text1MaxWidth = pageWidth2 - margin * 2 - (10 * mmToPt);
  const text1Lines = splitTextIntoLines(text1, font, 10, text1MaxWidth);
  for (const line of text1Lines) {
    page2.drawText(line, { x: margin + (10 * mmToPt), y: yPos, font, size: 10, color: grayColor });
    yPos -= 14; // Approx 5mm
  }
  yPos += 14 - (text1Lines.length * 5 * mmToPt) - (5 * mmToPt);

  // Option 2
  page2.drawCircle({ x: margin + (3 * mmToPt), y: yPos - (2 * mmToPt), size: 3 * mmToPt, color: tealColor });
  page2.drawText('2', { x: margin + (3 * mmToPt) - (boldFont.widthOfTextAtSize('2', 8)/2), y: yPos - (2 * mmToPt) - 3, font: boldFont, size: 8, color: rgb(1, 1, 1) });
  page2.drawText('Confirmation Email', { x: margin + (10 * mmToPt), y: yPos, font: boldFont, size: 10, color: darkColor });
  yPos -= (5 * mmToPt);
  const text2 = 'Click the "View Documents" button in the confirmation email sent to your registered email address for instant access.';
  const text2MaxWidth = pageWidth2 - margin * 2 - (10 * mmToPt);
  const text2Lines = splitTextIntoLines(text2, font, 10, text2MaxWidth);
  for (const line of text2Lines) {
    page2.drawText(line, { x: margin + (10 * mmToPt), y: yPos, font, size: 10, color: grayColor });
    yPos -= 14; // Approx 5mm
  }
  yPos += 14 - (text2Lines.length * 5 * mmToPt) - (10 * mmToPt);

  // Important Information Box
  const boxHeight = 70 * mmToPt;
  const boxWidth = pageWidth2 - margin * 2;
  const boxY = yPos;
  page2.drawRectangle({ x: margin, y: boxY - boxHeight, width: boxWidth, height: boxHeight, color: lightTealBackground, borderColor: tealColor, borderWidth: 0.5, cornerRadius: 3 * mmToPt });
  
  yPos = boxY - (8 * mmToPt);
  page2.drawText('Important Information', { x: margin + (5 * mmToPt), y: yPos, font: boldFont, size: 12, color: darkColor });
  yPos -= (8 * mmToPt);
  
  const bulletPoints = [
    "This is a digital document service. No physical items will be shipped.",
    "All documents are delivered electronically and are available immediately after payment confirmation.",
    "Refund Policy: We offer a full refund within 7 days of purchase if you experience any technical issues that prevent you from accessing or using your documents as intended.",
    "For technical support or refund requests, please contact our support team through the contact page on our website.",
  ];

  const bulletMaxWidth = boxWidth - (15 * mmToPt);
  for (const point of bulletPoints) {
    page2.drawText('•', { x: margin + (5 * mmToPt), y: yPos, font, size: 10, color: tealColor });
    const pointLines = splitTextIntoLines(point, font, 9, bulletMaxWidth);
    let pointLineY = yPos;
    for (const line of pointLines) {
        page2.drawText(line, { x: margin + (10 * mmToPt), y: pointLineY, font, size: 9, color: grayColor });
        pointLineY -= 11; // Approx 4mm
    }
    yPos = pointLineY + 11 - (pointLines.length * 4 * mmToPt) - (2 * mmToPt);
  }

  // Footer
  yPos = 20 * mmToPt;
  page2.drawLine({ start: { x: margin, y: yPos }, end: { x: pageWidth2 - margin, y: yPos }, color: lightGrayColor, thickness: 0.5 });
  yPos -= (5 * mmToPt);
  
  text = `© ${new Date().getFullYear()} ${siteName}`;
  textWidth = font.widthOfTextAtSize(text, 8);
  page2.drawText(text, { x: (pageWidth2 - textWidth) / 2, y: yPos, font, size: 8, color: grayColor });
  
  yPos -= (4 * mmToPt);
  text = 'For support, visit our website contact page';
  textWidth = font.widthOfTextAtSize(text, 8);
  page2.drawText(text, { x: (pageWidth2 - textWidth) / 2, y: yPos, font, size: 8, color: grayColor });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
