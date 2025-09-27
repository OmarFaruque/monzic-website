import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required." }, { status: 400 });
    }

    // Generate a new 6-digit verification code
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(newCode, 10);
    const newExpiration = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // (Simulation only) Log the new code for testing
    console.log(`New verification code for ${email}: ${newCode}`);

    await db
      .update(users)
      .set({
        verificationCodeHash: hashedCode,
        verificationCodeExpiresAt: newExpiration,
      })
      .where(eq(users.email, email.toLowerCase()));

    return NextResponse.json({ success: true, message: "A new verification code has been sent." });
  } catch (error) {
    console.error("Resend code error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}