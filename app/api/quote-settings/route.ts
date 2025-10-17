import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const quoteFormulaSetting = await db
      .select()
      .from(settings)
      .where(eq(settings.param, 'quoteFormula'))
      .limit(1);

    if (quoteFormulaSetting.length === 0) {
      return NextResponse.json({ success: false, error: 'Quote formula settings not found.' }, { status: 404 });
    }

    const quoteFormula = JSON.parse(quoteFormulaSetting[0].value || '{}');

    return NextResponse.json({ success: true, quoteFormula });
  } catch (error) { 
    return NextResponse.json({ success: false, error: 'Failed to fetch quote formula settings.' }, { status: 500 });
  }
}
