
import { db } from "@/lib/db";
import { coupons } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { promoCode, total } = await request.json();

    if (!promoCode) {
      return NextResponse.json({ error: "Promo code is required" }, { status: 400 });
    }

    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.promoCode, promoCode));

    

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
    if (usedQuota >= quotaAvailable) {
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
