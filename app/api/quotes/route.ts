import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quotes } from "@/lib/schema";
import { parse } from "date-fns";

export async function POST(req: NextRequest) {
  const { quoteData, user } = await req.json();

  if (!quoteData) {
    return NextResponse.json({ error: "Quote data is required." }, { status: 400 });
  }

  try {
    const policyNumber = `MON-${new Date().getTime()}`;

    const startDate = parse(quoteData.startTime, 'dd/MM/yy HH:mm', new Date());
    const endDate = parse(quoteData.expiryTime, 'dd/MM/yy HH:mm', new Date());
    const dateOfBirth = parse(quoteData.customerData.dateOfBirth, 'dd/MM/yyyy', new Date());

    await db.insert(quotes).values({
      policyNumber: policyNumber,
      userId: user?.id,
      regNumber: quoteData.customerData.registration,
      vehicleMake: quoteData.customerData.vehicle.make,
      vehicleModel: quoteData.customerData.vehicle.model,
      engineCC: quoteData.customerData.vehicle.engineCC,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      dateOfBirth: dateOfBirth.toISOString(),
      firstName: quoteData.customerData.firstName,
      lastName: quoteData.customerData.lastName,
      phone: quoteData.customerData.phoneNumber,
      licenceType: quoteData.customerData.licenseType,
      licencePeriod: quoteData.customerData.licenseHeld,
      address: quoteData.customerData.address,
      occupation: quoteData.customerData.occupation,
      coverReason: quoteData.customerData.reason,
      quoteData: JSON.stringify(quoteData),
      PaymentStatus: "paid",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save quote:", error);
    return NextResponse.json({ error: "Failed to save quote." }, { status: 500 });
  }
}