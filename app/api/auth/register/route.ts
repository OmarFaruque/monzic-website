import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { sendVerificationEmail } from '@/lib/verification-email';
import { eq } from 'drizzle-orm';
import { sign } from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ success: false, error: "All fields are required." }, { status: 400 });
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);
    const verificationCodeExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // (Simulation only) Log the code for testing purposes
    console.log(`Verification code for ${email}: ${verificationCode}`);

    // Add actual email sending logic here
    await sendVerificationEmail(email, verificationCode); 

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user with the verification code details
    await db.insert(users).values({
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      verificationCodeHash: hashedVerificationCode,
      verificationCodeExpiresAt,
    });

    // Do NOT return a JWT. User must verify first.
    return NextResponse.json({
      success: true,
      message: "Registration successful. Please check your email for a verification code.",
    });
  } catch (error: any) {
    if (error.code === "23505") { // Handle unique constraint violation for email
      return NextResponse.json({ success: false, error: "An account with this email already exists." }, { status: 409 });
    }
    console.error("Registration error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}