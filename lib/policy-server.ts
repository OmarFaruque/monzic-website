"use server"
import { db } from './db';
import { quotes, users } from './schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function validatePolicyAccess(
  policyNumber: string,
  surname: string,
  dateOfBirth: string, // Format: YYYY-MM-DD
  postcode: string,
): Promise<{ isValid: boolean; policy?: any; error?: string }> {
  
  // Find the policy
  // Replace mock data lookup with database query
  // Assumes you have a Prisma client instance imported as `prisma`
  // and your schema defines a Policy model matching PolicyData fields

  // Import Prisma client at the top of your file:


 const [policy] = await db.select().from(quotes).where(eq(quotes.policyNumber, policyNumber));


  if (!policy) {
    return { isValid: false, error: "Policy not found" };
  }

  if (!policy) {
    return { isValid: false, error: "Policy not found" }
  }

  // Validate surname (case insensitive)
  if (policy.lastName?.toLowerCase() !== surname.toLowerCase().trim()) {
    return { isValid: false, error: "Surname does not match our records" };
  }

  if (!policy.dateOfBirth) {
    return { isValid: false, error: "Date of birth is missing in the policy record" };
  }

  // Validate date of birth
  const policyDateOfBirth = policy.dateOfBirth.split(' ')[0]; // Extract date part only
  const inputDateOfBirth = dateOfBirth; // Input is already in YYYY-MM-DD format

  
  if (policyDateOfBirth !== inputDateOfBirth) {
    return { isValid: false, error: "Date of birth does not match our records" };
  }

  // Validate postcode (remove spaces and compare case insensitive)
  const normalizePostcode = (pc: string) => pc.replace(/\s/g, "").toLowerCase()
  if (normalizePostcode(policy.postCode ?? '') !== normalizePostcode(postcode)) {
    return { isValid: false, error: "Postcode does not match our records" }
  }

  return { isValid: true, policy }
}

// Get all policies
export async function getAllPolicies() {
  return await db.select().from(quotes);
}

// Create a new policy
export async function createPolicy(policyData: any) {
  return await db.insert(quotes).values(policyData).returning();
}

// Update a policy
export async function updatePolicy(policyId: number, policyData: any) {
  return await db.update(quotes).set(policyData).where(eq(quotes.id, policyId)).returning();
}

// Delete a policy
export async function deletePolicy(policyId: number) {
  return await db.delete(quotes).where(eq(quotes.id, policyId)).returning();
}

// Get all customers
export async function getCustomers() {
  const allUsers = await db.select().from(users);
  const allQuotes = await db.select().from(quotes);

  return allUsers.map((user) => {
    const userQuotes = allQuotes.filter((quote) => quote.userId === user.userId.toString());
    return {
      ...user,
      quotes: userQuotes,
      totalSpent: userQuotes.reduce((acc, quote) => acc + (Number(quote.quoteData) || 0), 0),
    };
  });
}