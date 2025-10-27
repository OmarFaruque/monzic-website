
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { sendEmail, createVerificationCodeEmail } from '@/lib/email';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Function to generate a random 6-digit code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
    const EXPIRE_MINUTES = 10;
    const expiresAt = new Date(Date.now() + EXPIRE_MINUTES * 60 * 1000); // 10 minutes from now

    await db.update(users).set({
      verificationCodeHash: hashedCode,
      verificationCodeExpiresAt: expiresAt.toISOString(),
    }).where(eq(users.email, email.toLowerCase()));

    const { subject, html } = await createVerificationCodeEmail(user.firstName || '', verificationCode, EXPIRE_MINUTES.toString());

    await sendEmail({
      to: email,
      subject,
      html,
    });

    return NextResponse.json({ message: 'Verification code sent' });

  } catch (error) {
    console.error('Error requesting verification code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
