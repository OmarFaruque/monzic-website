import { getSettings } from "@/lib/database"
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const paymentSettings = await getSettings("payment")
    const generalSettings = await getSettings("general")


    if (paymentSettings.length === 0) {
      return NextResponse.json({ error: 'Payment setting not found.' }, { status: 404 });
    }

    return NextResponse.json({ paymentProvider: paymentSettings, generalSettings: generalSettings});
  } catch (error) {
    console.error('Error fetching payment setting:', error);
    return NextResponse.json({ error: 'Failed to fetch payment setting.' }, { status: 500 });
  }
}
