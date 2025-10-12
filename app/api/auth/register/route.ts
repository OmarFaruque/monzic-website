import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { sendVerificationEmail } from '@/lib/verification-email';
import { eq } from 'drizzle-orm';
import { sign } from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email } = await request.json();

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ success: false, error: "All fields are required." }, { status: 400 });
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);
    const verificationCodeExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // (Simulation only) Log the code for testing purposes
    console.log(`Verification code for ${email}: ${verificationCode}`);
    console.log(`Verification code for ${email} expires at: ${verificationCodeExpiresAt.toISOString()}`);

    // Add actual email sending logic here
    await sendVerificationEmail(email, verificationCode); 

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      if (existingUser.emailVerifiedAt) {
        return NextResponse.json({ success: false, error: "An account with this email already exists." }, { status: 409 });
      } else {
        // User exists but is not verified, update their verification code
        await db.update(users).set({
          verificationCodeHash: hashedVerificationCode,
          verificationCodeExpiresAt: verificationCodeExpiresAt.toISOString(),
        }).where(eq(users.userId, existingUser.userId));
      }
    } else {
      // Insert the new user with the verification code details
      await db.insert(users).values({
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        verificationCodeHash: hashedVerificationCode,
        verificationCodeExpiresAt: verificationCodeExpiresAt.toISOString(),
      });
    }

    // Do NOT return a JWT. User must verify first.
    return NextResponse.json({
      success: true,
      message: "Registration successful. Please check your email for a verification code.",
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}