
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { sendEmail } from '@/lib/email';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Function to generate a random 6-digit code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Email template for the verification code
function createVerificationCodeEmail(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Verification Code</title>
    </head>
    <body>
      <h1>Your TEMPNOW Verification Code</h1>
      <p>Use the following code to log in to your account:</p>
      <h2>${code}</h2>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not request this code, please ignore this email.</p>
    </body>
    </html>
  `;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const verificationCode = generateVerificationCode();
    const hashedCode = await bcrypt.hash(verificationCode, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await db.update(users).set({
      verificationCodeHash: hashedCode,
      verificationCodeExpiresAt: expiresAt.toISOString(),
    }).where(eq(users.email, email.toLowerCase()));

    await sendEmail({
      to: email,
      subject: 'Your TEMPNOW Verification Code',
      html: createVerificationCodeEmail(verificationCode),
    });

    return NextResponse.json({ message: 'Verification code sent' });

  } catch (error) {
    console.error('Error requesting verification code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
