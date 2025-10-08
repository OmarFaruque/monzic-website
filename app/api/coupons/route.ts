import { db } from "@/lib/db";
import { coupons } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allCoupons = await db.select().from(coupons);
    const parsedCoupons = allCoupons.map(coupon => ({
      ...coupon,
      discount: coupon.discount,
      restrictions: coupon.restrictions,
      matches: coupon.matches,
    }))
    return NextResponse.json(parsedCoupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newCouponData = await request.json();
    const [insertedCoupon] = await db.insert(coupons).values({
      ...newCouponData,
      expires: newCouponData.expires || null,
      discount: JSON.stringify(newCouponData.discount),
      restrictions: JSON.stringify(newCouponData.restrictions),
      matches: JSON.stringify(newCouponData.matches),
    }).returning();
    return NextResponse.json(insertedCoupon);
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updatedCouponData } = await request.json();
    const [updatedCoupon] = await db
      .update(coupons)
      .set({
        ...updatedCouponData,
        expires: updatedCouponData.expires || null,
        discount: JSON.stringify(updatedCouponData.discount),
        restrictions: JSON.stringify(updatedCouponData.restrictions),
        matches: JSON.stringify(updatedCouponData.matches),
      })
      .where(eq(coupons.id, id))
      .returning();
    return NextResponse.json(updatedCoupon);
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await db.delete(coupons).where(eq(coupons.id, id));
    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}