import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sign } from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const userResult = await db.select().from(users).where(eq(users.email, email));

    if (userResult.length === 0) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const user = userResult[0];

    // Check if email is verified before allowing login
    if (!user.emailVerifiedAt) {
      return NextResponse.json({ message: 'Please verify your email before logging in.' }, { status: 403 });
    }

    const isPasswordValid = await compare(password, user.password!);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Create a user object to return to the frontend
    const userForFrontend = {
      id: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: 'user', // Assuming a default role of 'user'
    };

    // Create a JWT with more user info for session restoration
    const token = sign(
      { id: userForFrontend.id, email: userForFrontend.email, role: userForFrontend.role, firstName: user.firstName, lastName: user.lastName },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // CORRECTED: Return the user object along with the token
    return NextResponse.json({
      success: true,
      user: userForFrontend,
      token,
    }, { status: 200 });

  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}