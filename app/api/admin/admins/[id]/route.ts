import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { admins } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid admin ID' }, { status: 400 });
    }

    const deletedAdmin = await db.delete(admins).where(eq(admins.adminId, id)).returning();

    if (deletedAdmin.length === 0) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
