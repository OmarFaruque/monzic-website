import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tickets, messages } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = parseInt(params.id, 10);
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
    }

    

      // Fetch the ticket
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, ticketId));

    // Fetch the messages for the ticket
    const ticketMessages = await db.select().from(messages).where(eq(messages.ticketId, ticketId));



    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Mark the ticket as read
    await db.update(tickets).set({ unread: false }).where(eq(tickets.id, ticketId));

    return NextResponse.json({ ...ticket, messages: ticketMessages });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = parseInt(params.id, 10);
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const newMessage = await db
      .insert(messages)
      .values({
        ticketId: ticketId,
        message: message,
        isAdmin: true,
        messageId: Math.random().toString(36).substring(2, 15),
      })
      .returning();

    // Update the ticket's updatedAt timestamp
    await db.update(tickets).set({ updatedAt: new Date().toISOString() }).where(eq(tickets.id, ticketId));

    return NextResponse.json({ message: "Reply sent successfully", data: newMessage[0] }, { status: 201 });
  } catch (error) {
    console.error("Error sending reply:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = parseInt(params.id, 10);
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
    }

    const { status, priority } = await req.json();

    if (!status && !priority) {
      return NextResponse.json({ error: "Status or priority is required" }, { status: 400 });
    }

    const updateData: { status?: string; priority?: string; updatedAt: string } = {
      updatedAt: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
    }

    if (priority) {
      updateData.priority = priority;
    }

    const [updatedTicket] = await db
      .update(tickets)
      .set(updateData)
      .where(eq(tickets.id, ticketId))
      .returning();

    if (!updatedTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Fetch messages as well
    const ticketMessages = await db.select().from(messages).where(eq(messages.ticketId, ticketId));

    return NextResponse.json({ ...updatedTicket, messages: ticketMessages });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
