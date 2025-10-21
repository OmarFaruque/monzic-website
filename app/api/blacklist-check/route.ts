import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blacklist } from '@/lib/schema';
import { eq, or, and, ilike } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { ipAddress, regNumber, postcode, email, firstName, lastName, dateOfBirth } = await request.json();

    const blacklistConditions = [];

    // IP Address check
    if (ipAddress) {
      blacklistConditions.push(and(eq(blacklist.type, 'ip'), eq(blacklist.ipAddress, ipAddress)));
    }

    // Vehicle Registration Number check
    if (regNumber) {
      blacklistConditions.push(and(eq(blacklist.type, 'reg_number'), ilike(blacklist.regNumber, regNumber)));
    }

    // Postcode check
    if (postcode) {
      blacklistConditions.push(and(eq(blacklist.type, 'postcode'), ilike(blacklist.postcode, postcode)));
    }

    // User details check (email, firstName, lastName, dateOfBirth)
    if (email || firstName || lastName || dateOfBirth) {
      const userConditions = [];
      if (email) userConditions.push(ilike(blacklist.email, email));
      if (firstName) userConditions.push(ilike(blacklist.firstName, firstName));
      if (lastName) userConditions.push(ilike(blacklist.lastName, lastName));
      if (dateOfBirth) userConditions.push(eq(blacklist.dateOfBirth, dateOfBirth));

      // Fetch user blacklist entries to check their operator (AND/OR)
      const userBlacklistEntries = await db.select().from(blacklist).where(eq(blacklist.type, 'user'));

      for (const entry of userBlacklistEntries) {
        let matchCount = 0;
        let totalConditions = 0;

        if (entry.email) {
          totalConditions++;
          if (email && email.toLowerCase() === entry.email.toLowerCase()) matchCount++;
        }
        if (entry.firstName) {
          totalConditions++;
          if (firstName && firstName.toLowerCase() === entry.firstName.toLowerCase()) matchCount++;
        }
        if (entry.lastName) {
          totalConditions++;
          if (lastName && lastName.toLowerCase() === entry.lastName.toLowerCase()) matchCount++;
        }
        if (entry.dateOfBirth) {
          totalConditions++;
          if (dateOfBirth && dateOfBirth === entry.dateOfBirth) matchCount++;
        }

        if (totalConditions > 0) {
          if (entry.operator === 'AND' && matchCount === totalConditions) {
            return NextResponse.json({ isBlacklisted: true, reason: entry.reason || 'Blacklisted user details' });
          }
          if (entry.operator === 'OR' && matchCount > 0) {
            return NextResponse.json({ isBlacklisted: true, reason: entry.reason || 'Blacklisted user details' });
          }
        }
      }
    }

    if (blacklistConditions.length > 0) {
      const matchedItems = await db.select().from(blacklist).where(or(...blacklistConditions));
      if (matchedItems.length > 0) {
        // For simplicity, return the reason of the first matched item
        return NextResponse.json({ isBlacklisted: true, reason: matchedItems[0].reason || `Blacklisted ${matchedItems[0].type}` });
      }
    }

    return NextResponse.json({ isBlacklisted: false });

  } catch (error) {
    console.error('Error during blacklist check:', error);
    return NextResponse.json({ isBlacklisted: false, error: 'Internal server error during blacklist check.' }, { status: 500 });
  }
}
