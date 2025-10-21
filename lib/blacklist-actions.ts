'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { blacklist } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function createBlacklistItem(formData: any) {
  try {
    // console.log('Server: createBlacklistItem received formData:', formData);
    await db.insert(blacklist).values({
      type: formData.type,
      firstName: formData.firstName || null,
      lastName: formData.lastName || null,
      email: formData.email || null,
      dateOfBirth: formData.dateOfBirth || null,
      operator: formData.operator || 'AND',
      ipAddress: formData.ipAddress || null,
      postcode: formData.postcode || null,
      regNumber: formData.regNumber || null,
      reason: formData.reason || null,
    });

    revalidatePath('/administrator');
    return { success: true, message: 'Blacklist item added.' };
  } catch (error) {
    console.error('Error creating blacklist item:', error);
    return { success: false, message: 'Failed to add blacklist item.' };
  }
}

export async function updateBlacklistItem(id: number, formData: any) {
  try {
    // console.log('Server: updateBlacklistItem received id:', id, 'formData:', formData);
    await db.update(blacklist).set({
      type: formData.type,
      firstName: formData.firstName || null,
      lastName: formData.lastName || null,
      email: formData.email || null,
      dateOfBirth: formData.dateOfBirth || null,
      operator: formData.operator || 'AND',
      ipAddress: formData.ipAddress || null,
      postcode: formData.postcode || null,
      regNumber: formData.regNumber || null,
      reason: formData.reason || null,
    }).where(eq(blacklist.id, id));

    revalidatePath('/administrator');
    return { success: true, message: 'Blacklist item updated.' };
  } catch (error) {
    console.error('Error updating blacklist item:', error);
    return { success: false, message: 'Failed to update blacklist item.' };
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
