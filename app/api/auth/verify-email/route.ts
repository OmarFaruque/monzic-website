import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, error: "Email and code are required." }, { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!user || !user.verificationCodeHash || !user.verificationCodeExpiresAt) {
      return NextResponse.json({ success: false, error: "Invalid verification request." }, { status: 400 });
    }

    if (new Date() > new Date(user.verificationCodeExpiresAt)) {
      return NextResponse.json({ success: false, error: "Verification code has expired." }, { status: 410 });
    }

    const isCodeValid = await bcrypt.compare(code, user.verificationCodeHash);

    if (!isCodeValid) {
      return NextResponse.json({ success: false, error: "Invalid verification code." }, { status: 400 });
    }

    // Update user to mark as verified and clear verification fields
    await db
      .update(users)
      .set({
        email_verified_at: new Date(),
        verificationCodeHash: null,
        verificationCodeExpiresAt: null,
      })
      .where(eq(users.user_id, user.user_id));

    // Generate and return a JWT for the now-verified user
    const token = sign({ userId: user.user_id }, process.env.JWT_SECRET!, { expiresIn: "24h" });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully.",
      token,
      user: { id: user.user_id, email: user.email },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}