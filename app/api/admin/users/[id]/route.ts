import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, blacklist } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    await db.delete(users).where(eq(users.userId, userId));

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const user = await db.select().from(users).where(eq(users.userId, userId)).limit(1);
    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { email, firstName, lastName } = user[0];

    // Add to blacklist
    if (email) {
      await db.insert(blacklist).values({ type:  'user', email: email, reason: 'Blacklisted by admin user list' });
    }
    if (firstName && lastName) {
      await db.insert(blacklist).values({ type: 'user', firstName: `${firstName}`, lastName: `${lastName}`, reason: 'Blacklisted by admin user list' });
    }

    return NextResponse.json({ message: 'User blacklisted successfully' });
  } catch (error) {
    console.error('Error blacklisting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
