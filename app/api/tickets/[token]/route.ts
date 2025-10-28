import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tickets, messages } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getAdminEmail, sendEmail, createCustomerReplyEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params;

  if (!token) {
    return NextResponse.json({ error: 'Ticket token is required' }, { status: 400 });
  }

  try {
    // Find the ticket by its token
    const ticketResult = await db.select().from(tickets).where(eq(tickets.token, token)).limit(1);

    if (ticketResult.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticket = ticketResult[0];

    // Find associated messages
    const messageResult = await db.select().from(messages).where(eq(messages.ticketId, ticket.id)).orderBy(messages.createdAt);

    // Map DB structure to frontend structure
    const responseData = {
      id: `TKT-${ticket.id}`,
      subject: ticket.subject,
      customer: {
        name: `${ticket.firstName} ${ticket.lastName}`,
        email: ticket.email,
      },
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.policyNumber ? 'Policy' : 'General',
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      messages: messageResult.map(msg => ({
        id: `MSG-${msg.id}`,
        sender: msg.isAdmin ? 'admin' : 'customer',
        content: msg.message,
        timestamp: msg.createdAt,
        read: true,
        attachments: [],
      })),
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params;
  const formData = await request.formData();
  const message = formData.get('message') as string;
  const files = formData.getAll('attachments') as File[];

  if (!token) {
    return NextResponse.json({ error: 'Ticket token is required' }, { status: 400 });
  }
  if (!message || message.trim().length === 0) {
    return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
  }

  try {
    const ticketResult = await db.select().from(tickets).where(eq(tickets.token, token)).limit(1);
    if (ticketResult.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    const ticket = ticketResult[0];

    const newMessageData = {
      ticketId: ticket.id,
      message: message.trim(),
      isAdmin: false,
      messageId: uuidv4(),
    };
    const insertedMessageResult = await db.insert(messages).values(newMessageData).returning();
    const insertedMessage = insertedMessageResult[0];

    await db.update(tickets).set({ updatedAt: new Date().toISOString(), unread: true }).where(eq(tickets.id, ticket.id));

    // Prepare attachments for email
    const emailAttachments = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      emailAttachments.push({ filename: file.name, content: buffer });
    }

    const adminEmail = await getAdminEmail();
    const ticketUrl = `${request.nextUrl.protocol}//${request.headers.get('host')}/ticket/${ticket.token}`;
    const emailContent = await createCustomerReplyEmail({
      ticketId: ticket.id.toString(),
      ticketSubject: ticket.subject,
      customerName: `${ticket.firstName} ${ticket.lastName}`,
      message: message,
      ticketUrl: ticketUrl,
    });
    
    await sendEmail({
      to: adminEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      attachments: emailAttachments,
    });

    const responseMessage = {
        id: `MSG-${insertedMessage.id}`,
        sender: 'customer',
        content: insertedMessage.message,
        timestamp: insertedMessage.createdAt,
        read: true,
        attachments: [], // We don't return attachment info as it's not stored
    };

    return NextResponse.json(responseMessage, { status: 201 });

  } catch (error) {
    console.error('Error submitting reply:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
