import { db } from "@/lib/db";
import { quotes, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { sendEmail, createInsurancePolicyEmail } from "@/lib/email";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, parseInt(id, 10)));

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error("Error fetching quote:", error);
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    const { updatePrice, promoCode, PaymentStatus, PaymentMethod, PaymentIntentId, userId } = body;


    if (!id) {
      return NextResponse.json({ error: "Quote ID is required" }, { status: 400 });
    }

    // If payment is successful, send email before updating the DB
    if (PaymentStatus === "paid" && userId) {
      // 1. Fetch user and quote details
      const [user] = await db.select().from(users).where(eq(users.userId, userId));
      const [quote] = await db.select().from(quotes).where(eq(quotes.id, parseInt(id, 10)));

      if (user && quote) {
        // 2. Create email content
        const policyDocumentLink = `${process.env.NEXT_PUBLIC_BASE_URL}/policy/view/${quote.policyNumber}`;
        const emailHtml = createInsurancePolicyEmail(
          `${user.firstName} ${user.lastName}`,
          quote.policyNumber,
          `${quote.vehicleMake} ${quote.vehicleModel}`,
          new Date(quote.startDate).toLocaleString(),
          new Date(quote.endDate).toLocaleString(),
          parseFloat(quote.cpw),
          policyDocumentLink
        );

        // 3. Send email
        await sendEmail({
          to: user.email,
          subject: `Your Insurance Policy is Confirmed - ${quote.policyNumber}`,
          html: emailHtml,
        });
      }
    }

    const [updatedQuote] = await db
      .update(quotes)
      .set(body)
      .where(eq(quotes.id, parseInt(id, 10)))
      .returning();

    if (!updatedQuote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json(updatedQuote);
  } catch (error) {
    console.error("Error updating quote:", error);
    return NextResponse.json({ error: "Failed to update quote" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await db.delete(quotes).where(eq(quotes.id, parseInt(id, 10)));

    return NextResponse.json({ message: "Quote deleted successfully" });
  } catch (error) {
    console.error("Error deleting quote:", error);
    return NextResponse.json({ error: "Failed to delete quote" }, { status: 500 });
  }
}
