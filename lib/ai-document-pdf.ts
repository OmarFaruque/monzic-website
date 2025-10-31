
import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';

function splitTextIntoLines(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
    const allLines: string[] = [];
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
        const words = paragraph.split(' ');
        if (words.length === 1 && words[0] === '') {
            allLines.push('');
            continue;
        }

        let currentLine = words[0] || '';

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            if (!word) continue;
            const testLine = currentLine + " " + word;
            const width = font.widthOfTextAtSize(testLine, fontSize);
            if (width < maxWidth) {
                currentLine = testLine;
            } else {
                allLines.push(currentLine);
                currentLine = word;
            }
        }
        allLines.push(currentLine);
    }
    return allLines;
}

export async function generateAiDocumentPdf(title: string, content: string, siteName: string, companyName: string) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const tealColor = rgb(20 / 255, 184 / 255, 166 / 255);
  const darkColor = rgb(15 / 255, 23 / 255, 42 / 255);
  const grayColor = rgb(100 / 255, 116 / 255, 139 / 255);
  const lightGrayColor = rgb(226 / 255, 232 / 255, 240 / 255);
  const mmToPt = 2.83465;
  const margin = 20 * mmToPt;

  let page = pdfDoc.addPage();
  const { width: pageWidth, height: pageHeight } = page.getSize();
  let yPos = pageHeight;

  // Header
  page.drawRectangle({
    x: 0,
    y: pageHeight - (30 * mmToPt),
    width: pageWidth,
    height: 30 * mmToPt,
    color: tealColor,
  });
  const headerText = siteName.toUpperCase();
  const headerTextWidth = boldFont.widthOfTextAtSize(headerText, 24);
  page.drawText(headerText, {
    x: (pageWidth - headerTextWidth) / 2,
    y: pageHeight - (20 * mmToPt),
    font: boldFont,
    size: 24,
    color: rgb(1, 1, 1),
  });

  yPos = pageHeight - (50 * mmToPt);
  const contentMaxWidth = pageWidth - margin * 2;

  // Main Title
  const titleLines = splitTextIntoLines(title, boldFont, 20, contentMaxWidth);
  for (const line of titleLines) {
      page.drawText(line, { x: margin, y: yPos, font: boldFont, size: 20, color: darkColor });
      yPos -= 24; // Line height for title
  }
  yPos -= (10 * mmToPt);

  // Content
  const contentWithoutTitle = content.replace(/<h1>.*?<\/h1>/i, ''); // Remove H1 to avoid duplicate title
  const processedContent = contentWithoutTitle.replace(/<br\s*\/?>/gi, '\n');
  
  const regex = /<(\w+)[^>]*>([\s\S]*?)<\/\1>/g;
  let match;
  let isFirstMatch = true;

  while ((match = regex.exec(processedContent)) !== null) {
    if (isFirstMatch) {
        isFirstMatch = false;
        const textOfFirstElement = match[2].replace(/<[^>]+>/g, '').trim();
        if (textOfFirstElement.toLowerCase() === title.toLowerCase()) {
            continue; // Skip rendering the title from the content as it's already been drawn
        }
    }

    if (yPos < margin) {
        page = pdfDoc.addPage();
        yPos = page.getSize().height - margin;
    }
    
    const tagName = match[1].toLowerCase();
    const innerContent = match[2].trim();

    if (!innerContent) continue;

    const strongOnlyMatch = innerContent.match(/^<strong>(.*?)<\/strong>$/i);
    
    let textFont = font;
    let fontSize = 10;
    let color = grayColor;
    let isListItem = false;
    let lineHeight = 14;
    let marginBottom = 10;
    let innerText = "";

    if (tagName === 'p' && strongOnlyMatch) {
        textFont = boldFont;
        fontSize = 12;
        color = darkColor;
        lineHeight = 16;
        marginBottom = 8;
        innerText = strongOnlyMatch[1].replace(/<[^>]+>/g, '').trim();
    } else {
        innerText = innerContent.replace(/<[^>]+>/g, '').trim();
        switch(tagName) {
            case 'h1':
                textFont = boldFont;
                fontSize = 18;
                color = darkColor;
                lineHeight = 22;
                marginBottom = 15;
                break;
            case 'h2':
                textFont = boldFont;
                fontSize = 16;
                color = darkColor;
                lineHeight = 20;
                marginBottom = 12;
                break;
            case 'h3':
                textFont = boldFont;
                fontSize = 14;
                color = darkColor;
                lineHeight = 18;
                marginBottom = 10;
                break;
            case 'h4':
            case 'strong': // Treat strong tags as h4
                textFont = boldFont;
                fontSize = 12;
                color = darkColor;
                lineHeight = 16;
                marginBottom = 8;
                break;
            case 'h5':
                textFont = boldFont;
                fontSize = 11;
                color = darkColor;
                lineHeight = 15;
                marginBottom = 7;
                break;
            case 'h6':
                textFont = boldFont;
                fontSize = 10;
                color = darkColor;
                lineHeight = 14;
                marginBottom = 6;
                break;
            case 'p':
                break;
            case 'li':
                isListItem = true;
                marginBottom = 5;
                break;
            default:
                // Treat as paragraph
                break;
        }
    }

    if (!innerText) continue;

    const textMaxWidth = isListItem ? contentMaxWidth - 20 : contentMaxWidth;
    const lines = splitTextIntoLines(innerText, textFont, fontSize, textMaxWidth);
    
    for (const line of lines) {
        if (yPos < margin) {
            page = pdfDoc.addPage();
            yPos = page.getSize().height - margin;
        }
        if (isListItem) {
            page.drawText('•', { x: margin, y: yPos, font, size: 10, color: tealColor });
            page.drawText(line, { x: margin + 15, y: yPos, font: textFont, size: fontSize, color });
        } else {
            page.drawText(line, { x: margin, y: yPos, font: textFont, size: fontSize, color });
        }
        yPos -= lineHeight;
    }
    yPos -= marginBottom;
  }

  // Footer
  const footerY = 20 * mmToPt;
  page.drawLine({ start: { x: margin, y: footerY }, end: { x: pageWidth - margin, y: footerY }, color: lightGrayColor, thickness: 0.5 });
  
  let text = `© ${new Date().getFullYear()} ${siteName}`;
  let textWidth = font.widthOfTextAtSize(text, 8);
  page.drawText(text, { x: (pageWidth - textWidth) / 2, y: footerY - (5 * mmToPt), font, size: 8, color: grayColor });
  
  text = `Generated by ${companyName}`;
  textWidth = font.widthOfTextAtSize(text, 8);
  page.drawText(text, { x: (pageWidth - textWidth) / 2, y: footerY - (5 * mmToPt) - 12, font, size: 8, color: grayColor });

  return pdfDoc.save();
}
