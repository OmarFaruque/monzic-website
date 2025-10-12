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

    const now = new Date();
    const expiresAt = new Date(user.verificationCodeExpiresAt);
    

    if (now > expiresAt) {
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
        emailVerifiedAt: new Date().toISOString(),
        verificationCodeHash: null,
        verificationCodeExpiresAt: null,
      })
      .where(eq(users.userId, user.userId));

    // Generate and return a JWT for the now-verified user
    const token = sign({ id: user.userId, email: user.email, firstName: user.firstName, lastName: user.lastName, role: 'user' }, process.env.JWT_SECRET!, { expiresIn: "24h" });



    return NextResponse.json({
      success: true,
      message: "Email verified successfully.",
      token,
      user: {
        id: user.userId,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: 'user'
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}