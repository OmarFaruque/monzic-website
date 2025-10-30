import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { quotes, users, aiDocuments, settings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sendEmail, createAIDocumentPurchaseEmail, createAdminNotificationEmail, getAdminEmail } from '@/lib/email';

import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  
  const stripeSettingsRecord = await db.select().from(settings).where(eq(settings.param, 'stripe')).limit(1);

  if (!stripeSettingsRecord || stripeSettingsRecord.length === 0 || !stripeSettingsRecord[0].value) {
    console.error('Stripe settings not found in database.');
    return NextResponse.json({ error: 'Stripe settings not configured.' }, { status: 500 });
  }

  const stripeConfig = JSON.parse(stripeSettingsRecord[0].value);
  const secretKey = stripeConfig.secretKey;
  const webhookSecret = stripeConfig.webhookSecret;

  if (!secretKey || !webhookSecret) {
    console.error('Stripe secretKey or webhookSecret is missing from database settings.');
    return NextResponse.json({ error: 'Stripe credentials not fully configured.' }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2024-04-10',
  });

  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const metadata = paymentIntent.metadata;

    // Process the event in the background to avoid timeouts
    (async () => {
      try {
        if (metadata.type === 'quote') {
          const quoteId = metadata.quote_id;
          if (!quoteId) {
            console.error('Webhook Error: quote_id not found in metadata');
            return;
          }

          // 1. Update the quote with payment details (fast operation)
          const updateTimestamp = new Date().toISOString();
          await db.update(quotes).set({
              status: 'completed',
              paymentStatus: 'paid',
              paymentMethod: 'stripe',
              mailSent: false, // Mark as not sent yet, the next step will handle it
              paymentIntentId: paymentIntent.id,
              paymentDate: updateTimestamp,
              updatedAt: updateTimestamp,
          }).where(eq(quotes.id, quoteId));

          // 2. Trigger the email sending API without awaiting the response (fire-and-forget)
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quoteId }),
          });

        } else if (metadata.type === 'ai_document') {
          // This logic can also be moved to a separate endpoint if it proves to be slow
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
          const emailData = await createAIDocumentPurchaseEmail(
            userDetails.firstName,
            userDetails.lastName,
            paymentIntent.id,
            new Date(paymentIntent.created * 1000).toLocaleDateString(),
            docDetails.price,
            docDetails.prompt,
            downloadLink
          );
          
          await sendEmail({
              to: userDetails.email,
              subject: emailData.subject,
              html: emailData.html,
          });

          const adminNotificationData = await createAdminNotificationEmail(
              "ai_document",
              userDetails.firstName,
              userDetails.email,
              docDetails.price,
              `Document Type: ${docDetails.prompt}`
          );
          const adminEmail = await getAdminEmail();
          await sendEmail({
              to: adminEmail,
              subject: adminNotificationData.subject,
              html: adminNotificationData.html,
          });
        }
      } catch (error) {
        console.error("Error processing webhook in background:", error);
      }
    })();
  }

  return NextResponse.json({ received: true });
}
