
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tickets, messages } from "@/lib/schema";
import { sendTicketConfirmationEmail } from "@/lib/email";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, subject, message } = await req.json();

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let ticketToUpdate = await db.query.tickets.findFirst({
      where: and(eq(tickets.email, email), eq(tickets.isClosed, false)),
    });

    let ticketId: number;
    let ticketToken: string;

    if (ticketToUpdate) {
      // Update existing ticket
      await db.update(tickets).set({ unread: true, updatedAt: new Date().toISOString() }).where(eq(tickets.id, ticketToUpdate.id));
      ticketId = ticketToUpdate.id;
      ticketToken = ticketToUpdate.token;
    } else {
      // Create new ticket
      const newTicket = await db
        .insert(tickets)
        .values({
          firstName,
          lastName,
          email,
          subject,
          token: Math.random().toString(36).substring(2, 15),
        })
        .returning();
      ticketId = newTicket[0].id;
      ticketToken = newTicket[0].token;

      await sendTicketConfirmationEmail({
        to: email,
        subject: "We have received your ticket",
        name: `${firstName} ${lastName}`,
        ticketId: ticketToken,
      });
    }

    // Add message to messages table
    await db.insert(messages).values({
      ticketId: ticketId,
      messageId: Math.random().toString(36).substring(2, 15),
      message: message,
    });

    return NextResponse.json({ message: "Ticket updated successfully", ticket: { id: ticketId, token: ticketToken } }, { status: 201 });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
