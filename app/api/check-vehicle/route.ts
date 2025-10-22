import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/schema';
import { eq } from 'drizzle-orm';



interface StoredToken {
  access_token: string;
  datetime: string; // ISO 8601 date string
}

async function getMotAccessToken(): Promise<string> {
  // 1. Check for an existing, valid token in the database
  const tokenRecord = await db.query.settings.findFirst({
    where: eq(settings.param, 'mot_token'),
  });

  if (tokenRecord?.value) {
    const storedToken: StoredToken = JSON.parse(tokenRecord.value);
    const storedTime = new Date(storedToken.datetime);
    const now = new Date();
    const minutesDiff = (now.getTime() - storedTime.getTime()) / (1000 * 60);

    // If token is still valid (less than 58 minutes old), return it
    if (minutesDiff < 58) {
      return storedToken.access_token;
    }
  }

  // 2. If no valid token, request a new one
  const { MOT_CLIENT_ID, MOT_CLIENT_SECRET, MOT_SCOPE_URL, MOT_TOKEN_URL } = process.env;

  if (!MOT_CLIENT_ID || !MOT_CLIENT_SECRET || !MOT_SCOPE_URL || !MOT_TOKEN_URL) {
    throw new Error("Missing MOT client credentials in environment variables.");
  }

  const response = await fetch(MOT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: MOT_CLIENT_ID,
      client_secret: MOT_CLIENT_SECRET,
      scope: MOT_SCOPE_URL,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Failed to retrieve MOT access token:", errorBody);
    throw new Error('Failed to retrieve access token from MOT service.');
  }

  const tokenData = await response.json();
  const accessToken = tokenData.access_token;

  // 3. Store the new token and timestamp in the database
  const newTokenToStore: StoredToken = {
    access_token: accessToken,
    datetime: new Date().toISOString(),
  };

  await db
    .insert(settings)
    .values({ param: 'mot_token', value: JSON.stringify(newTokenToStore) })
    .onConflictDoUpdate({
      target: settings.param,
      set: { value: JSON.stringify(newTokenToStore) },
    });

  return accessToken;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const registration: string | undefined = body.registration;

    if (!registration || typeof registration !== 'string' || registration.trim() === '') {
      return NextResponse.json({ message: 'Vehicle registration is required.' }, { status: 400 });
    }

    const cleanReg = registration.trim().replace(/\s/g, '');

    const settingsFromDb = await db.query.settings.findFirst({
      where: eq(settings.param, 'general')
    });

    const generalSettings = settingsFromDb?.value ? JSON.parse(settingsFromDb.value) : {};
    const apiProvider = generalSettings.carSearchApiProvider || 'dayinsure';

    let carDetails;

    if (apiProvider === 'mot') {
      // --- Logic for MOT API ---
      const apiKey = process.env.MOT_API_KEY;
      if (!apiKey) {
        throw new Error("MOT_API_KEY is not configured in environment variables.");
      }
      
      const accessToken = await getMotAccessToken();
      const apiUrl = `https://history.mot.api.gov.uk/v1/trade/vehicles/registration/${encodeURIComponent(cleanReg)}`;

      const apiResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-API-Key': apiKey,
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({}));
        return NextResponse.json({ message: errorData.errorMessage || 'Failed to retrieve vehicle details from MOT API.' }, { status: 400 });
      }

      const data = await apiResponse.json();

      
      carDetails = {
        registration: data.registration,
        make: data.make,
        model: data.model,
        engineCapacity: data.engineSize,
        year: data.yearOfManufacture || "Unknown",
        color: data.primaryColour,
      };

    } else {
      // --- Logic for Dayinsure API (default) ---
      const apiUrl = `https://web-api.dayinsure.com/api/v1/vehicle/${cleanReg}`;
      
      const apiResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      console.log('else inside');

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({}));
        return NextResponse.json({ message: errorData.errorMessage || 'Failed to retrieve vehicle details.' }, { status: 400 });
      }

      const data = await apiResponse.json();
      const vehicleDetail = data?.detail;

      if (!vehicleDetail) {
        return NextResponse.json({ message: 'Incomplete vehicle data received.' }, { status: 500 });
      }

      carDetails = {
        registration: vehicleDetail.registration,
        make: vehicleDetail.make,
        model: vehicleDetail.model,
        engineCapacity: vehicleDetail.engineSize,
        year: vehicleDetail.year || "Unknown",
        color: vehicleDetail.colour,
      };
    }

    return NextResponse.json(carDetails, { status: 200 });

  } catch (error) {
    console.error("Check-vehicle API error:", error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}