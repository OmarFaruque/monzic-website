'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { blacklist } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function createBlacklistItem(formData: any) {
  try {
    await db.insert(blacklist).values({
      type: formData.type,
      firstName: formData.firstName || null,
      lastName: formData.lastName || null,
      email: formData.email || null,
      dateOfBirth: formData.dateOfBirth || null,
      operator: formData.operator || 'AND',
      ipAddress: formData.ipAddress || null,
      postcode: formData.postcode || null,
      reason: formData.reason || null,
    });

    revalidatePath('/administrator');
    return { success: true, message: 'Blacklist item added.' };
  } catch (error) {
    console.error('Error creating blacklist item:', error);
    return { success: false, message: 'Failed to add blacklist item.' };
  }
}

export async function deleteBlacklistItem(id: number) {
  try {
    await db.delete(blacklist).where(eq(blacklist.id, id));
    revalidatePath('/administrator');
    return { success: true, message: 'Blacklist item removed.' };
  } catch (error) {
    console.error('Error deleting blacklist item:', error);
    return { success: false, message: 'Failed to remove blacklist item.' };
  }
}
