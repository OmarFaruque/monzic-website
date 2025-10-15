import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { admins } from '@/lib/schema';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const allAdmins = await db.select({
      adminId: admins.adminId,
      fname: admins.fname,
      lname: admins.lname,
      email: admins.email,
      role: admins.role,
      createdAt: admins.createdAt,
      updatedAt: admins.updatedAt,
    }).from(admins);
    return NextResponse.json(allAdmins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, role, password } = await request.json();

    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [fname, ...lnameParts] = name.split(' ');
    const lname = lnameParts.join(' ');

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await db.insert(admins).values({
      fname,
      lname,
      email,
      role,
      password: hashedPassword,
    }).returning({
        adminId: admins.adminId,
        fname: admins.fname,
        lname: admins.lname,
        email: admins.email,
        role: admins.role,
    });

    return NextResponse.json(newAdmin[0], { status: 201 });
  } catch (error) {
    console.error('Error creating admin:', error);
    if ((error as any).code === '23505') {
        return NextResponse.json({ error: 'An admin with this email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
