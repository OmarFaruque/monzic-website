import { db } from "./db"
import { quotes, users, settings } from "./schema"
import { eq, and } from "drizzle-orm"
import type { Quote, User } from "./definitions"

export async function getPoliciesByUserId(userId: string): Promise<any[]> {
  const userPolicies = await db.select().from(quotes).where(and(eq(quotes.userId, userId), eq(quotes.paymentStatus, 'paid')))

  const now = new Date();

  return userPolicies.map(policy => {
    const startDate = new Date(policy.startDate);
    const endDate = new Date(policy.endDate);
    let status = policy.status; // Preserve existing status if set (e.g., 'cancelled')

    if (status !== 'cancelled') { // Only calculate if not explicitly cancelled
      if (now < startDate) {
        status = 'pending';
      } else if (now >= startDate && now <= endDate) {
        status = 'active';
      } else if (now > endDate) {
        status = 'expired';
      }
    }

    return { ...policy, status };
  });
}

export async function getUserById(userId: string): Promise<any | null> {
  const [user] = await db.select().from(users).where(eq(users.userId, parseInt(userId, 10)))
  return user || null
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  const [updatedUser] = await db.update(users).set(updates).where(eq(users.userId, parseInt(userId, 10))).returning()
  return updatedUser || null
}

export async function getSettings(param: string): Promise<any | null> {
  const [setting] = await db.select().from(settings).where(eq(settings.param, param))
  if (setting && setting.value) {
    return JSON.parse(setting.value)
  }
  return null
}
