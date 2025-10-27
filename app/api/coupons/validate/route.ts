import { db } from "@/lib/db";
import { coupons } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { promoCode, total } = await request.json();

    if (!promoCode) {
      return NextResponse.json({ error: "Promo code is required" }, { status: 400 });
    }

    const potentialCoupons = await db
      .select()
      .from(coupons)
      .where(eq(sql`lower(${coupons.promoCode})`, promoCode.toLowerCase()));

    if (potentialCoupons.length === 0) {
      return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
    }

    // Prioritize case-sensitive match if available
    let coupon = potentialCoupons.find(c => c.caseSensitive && c.promoCode === promoCode);

    if (!coupon) {
      // If no case-sensitive match, find the first case-insensitive one
      coupon = potentialCoupons.find(c => !c.caseSensitive);
    }

    if (!coupon) {
      return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "This promo code is not active" }, { status: 400 });
    }

    if (coupon.expires && new Date(coupon.expires) < new Date()) {
      return NextResponse.json({ error: "This promo code has expired" }, { status: 400 });
    }

    const usedQuota = parseInt(coupon.usedQuota || '0', 10);
    const quotaAvailable = parseInt(coupon.quotaAvailable, 10);
    if (quotaAvailable > 0 && usedQuota >= quotaAvailable) {
      return NextResponse.json({ error: "This promo code has reached its usage limit" }, { status: 400 });
    }
    
    if (coupon.minSpent) {
        const minSpent = parseFloat(coupon.minSpent);
        if (total === undefined || total <  minSpent) {
            return NextResponse.json({ error: `A minimum spend of £${minSpent.toFixed(2)} is required for this code.` }, { status: 400 });
        }
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}