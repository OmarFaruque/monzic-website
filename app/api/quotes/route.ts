import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quotes, coupons } from "@/lib/schema";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";

const quoteSchema = z.object({
  userId: z.any().optional(),
  total: z.number(),
  originalTotal: z.number().optional(),
  cpw: z.string().optional(),
  update_price: z.string().optional(),
  startTime: z.string(),
  expiryTime: z.string(),
  breakdown: z.object({
    duration: z.string(),
    reason: z.string(),
  }),
  customerData: z.object({
    firstName: z.string(),
    middleName: z.string().optional(),
    lastName: z.string(),
    dateOfBirth: z.string(),
    phoneNumber: z.string(),
    occupation: z.string(),
    address: z.string(),
    licenseType: z.string(),
    licenseHeld: z.string(),
    vehicleValue: z.string(),
    reason: z.string(),
    duration: z.string(),
    registration: z.string(),
    post_code: z.string(),
    vehicle: z.object({
      make: z.string(),
      model: z.string(),
      year: z.string(),
      engineCC: z.string(),
    }),
  }),
  promoCode: z.string().optional(),
});

function parseCustomDate(dateString: string): Date {
    try {
      const [datePart, timePart] = dateString.split(" ");
      const [day, month, year] = datePart.split("/");
      const [hours, minutes] = timePart.split(":");
      return new Date(`20${year}-${month}-${day}T${hours}:${minutes}:00`);
  } catch (error) {
      throw new Error(`Invalid custom date format: ${dateString}`);
  }
}

function parseDateOfBirth(dateString: string): Date {
  if (!dateString || typeof dateString !== "string") {
    throw new Error(`Invalid date string: ${dateString}`);
  }

  const [day, month, year] = dateString.split("/");
  if (!day || !month || !year) {
    throw new Error(`Invalid date format: ${dateString}`);
  }

  const fullYear = year.length === 2 ? (parseInt(year, 10) > 50 ? `19${year}` : `20${year}`) : year;

  try {
    return new Date(`${fullYear}-${month}-${day}`);
  } catch (error) {
    throw new Error(`Failed to parse date of birth: ${dateString}`);
  }
}

export async function GET() {
  try {
    const allQuotes = await db.select().from(quotes);
    return NextResponse.json(allQuotes);
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { quoteData: rawQuoteData } = await request.json();

    

    const quoteData = quoteSchema.parse(rawQuoteData);

    if (quoteData.promoCode) {
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.promoCode, quoteData.promoCode));

      if (coupon) {
        await db
          .update(coupons)
          .set({
            usedQuota: sql`cast(${coupons.usedQuota} as integer) + 1`,
          })
          .where(eq(coupons.id, coupon.id));
      }
    }

    // Generate a temporary policy number
    const policyNumber = `P-${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 10)}`;;


    const newQuote = await db
      .insert(quotes)
      .values({
        policyNumber: policyNumber,
        userId: quoteData.userId,
        cpw: String(quoteData.cpw || quoteData.originalTotal || quoteData.total),
        updatePrice: String(quoteData.update_price || quoteData.total),
        regNumber: quoteData.customerData.registration,
        vehicleMake: quoteData.customerData.vehicle.make,
        vehicleModel: quoteData.customerData.vehicle.model,
        startDate: parseCustomDate(quoteData.startTime).toISOString(),
        endDate: parseCustomDate(quoteData.expiryTime).toISOString(),
        dateOfBirth: parseDateOfBirth(quoteData.customerData.dateOfBirth).toISOString(),
        firstName: quoteData.customerData.firstName,
        lastName: quoteData.customerData.lastName,
        phone: quoteData.customerData.phoneNumber,
        licenceType: quoteData.customerData.licenseType,
        licencePeriod: quoteData.customerData.licenseHeld,
        coverReason: quoteData.customerData.reason,
        quoteData: JSON.stringify(quoteData),
        postCode: quoteData.customerData.post_code,
        address: quoteData.customerData.address,
        occupation: quoteData.customerData.occupation,
        vehicleType: quoteData.customerData.vehicle.make + " " + quoteData.customerData.vehicle.model,
        engineCC: quoteData.customerData.vehicle.engineCC,
        status: 'pending',
        promoCode: quoteData.promoCode,
      })
      .returning();

    return NextResponse.json(newQuote[0]);
  } catch (error) {
    console.error("Error creating quote:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid quote data", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
