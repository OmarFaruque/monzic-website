import { NextResponse } from 'next/server';
import { validatePolicyAccess } from '@/lib/policy-server';

export async function POST(request: Request) {
  try {
    const { policyNumber, surname, dateOfBirth, postcode } = await request.json();

    if (!policyNumber || !surname || !dateOfBirth || !postcode) {
      return NextResponse.json({ error: 'Missing required validation fields' }, { status: 400 });
    }

    const result = await validatePolicyAccess(policyNumber, surname, dateOfBirth, postcode);

    if (result.isValid) {
      // Only return a success status, not the full policy data
      return NextResponse.json({ isValid: true });
    } else {
      // Return the specific error message for logging, but the client should use a generic message
      return NextResponse.json({ isValid: false, error: result.error }, { status: 401 });
    }
  } catch (error) {
    console.error("Policy validation API error:", error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}