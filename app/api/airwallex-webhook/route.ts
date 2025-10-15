
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quotes, users, aiDocuments, settings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sendEmail, createAIDocumentPurchaseEmail, createAdminNotificationEmail, getAdminEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const airwallexSettingsRecord = await db.select().from(settings).where(eq(settings.param, 'airwallex')).limit(1);

  if (!airwallexSettingsRecord || airwallexSettingsRecord.length === 0 || !airwallexSettingsRecord[0].value) {
    console.error('Airwallex settings not found in database.');
    return NextResponse.json({ error: 'Airwallex settings not configured.' }, { status: 500 });
  }

  const airwallexConfig = JSON.parse(airwallexSettingsRecord[0].value);
  const webhookSecret = airwallexConfig.webhookSecret;

  if (!webhookSecret) {
    console.error('Airwallex webhookSecret is missing from database settings.');
    return NextResponse.json({ error: 'Airwallex credentials not fully configured.' }, { status: 500 });
  }

  const signature = req.headers.get('x-signature');
  const timestamp = req.headers.get('x-timestamp');
  const body = await req.text();

  if (!signature || !timestamp || !body) {
    return NextResponse.json({ error: 'Missing required headers or body.' }, { status: 400 });
  }

  try {
    const valueToDigest = `${timestamp}${body}`;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(valueToDigest)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('Webhook signature verification failed.');
      return NextResponse.json({ error: 'Failed to verify webhook signature.' }, { status: 403 });
    }
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return NextResponse.json({ error: 'Internal server error during signature verification.' }, { status: 500 });
  }

  const event = JSON.parse(body);

  if (event.name === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const metadata = paymentIntent.metadata;

    (async () => {
      try {
        if (metadata.type === 'quote') {
          const quoteId = metadata.quote_id;
          if (!quoteId) {
            console.error('Webhook Error: quote_id not found in metadata');
            return;
          }

          await db.update(quotes).set({
              status: 'completed',
              paymentStatus: 'paid',
              paymentMethod: 'airwallex',
              mailSent: true,
              paymentIntentId: paymentIntent.id,
              updatedAt: new Date().toISOString(),
          }).where(eq(quotes.id, quoteId));

          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quoteId }),
          });

        } else if (metadata.type === 'ai_document') {
          const docDetails = JSON.parse(metadata.document_details);
          const userDetails = JSON.parse(metadata.user_details);

          const newDocument = await db.insert(aiDocuments).values({
              uuid: uuidv4(),
              prompt: docDetails.prompt,
              content: docDetails.content,
              email: userDetails.email,
              userId: userDetails.id,
              amount: docDetails.price,
              status: 'paid',
          }).returning({ id: aiDocuments.id, uuid: aiDocuments.uuid });

          const documentUuid = newDocument[0].uuid;

          const downloadLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ai-documents/download-pdf/${documentUuid}`;
          const emailHtml = createAIDocumentPurchaseEmail(userDetails.firstName, docDetails.prompt, downloadLink);
          
          await sendEmail({
              to: userDetails.email,
              subject: 'Your AI Document is Ready - TEMPNOW',
              html: emailHtml,
          });

          const adminNotificationHtml = createAdminNotificationEmail(
              'ai_document',
              userDetails.firstName,
              userDetails.email,
              docDetails.price,
              `Document Type: ${docDetails.prompt}`
          );
          const adminEmail = await getAdminEmail();
          await sendEmail({
              to: adminEmail,
              subject: `New Purchase Alert - AI Document`,
              html: adminNotificationHtml,
          });
        }
      } catch (error) {
        console.error('Error processing webhook in background:', error);
      }
    })();
  }

  return NextResponse.json({ received: true });
}
