import { type NextRequest, NextResponse } from "next/server"
import { lookupVehicleByRegistration, mockVehicleLookup } from "@/lib/vehicle-api"

export async function GET(request: NextRequest) {
  // Get registration from query params
  const searchParams = request.nextUrl.searchParams
  const registration = searchParams.get("registration")

  // Check if registration is provided
  if (!registration) {
    return NextResponse.json({ error: true, message: "Registration number is required" }, { status: 400 })
  }

  try {
    // Use mock lookup in development or when testing, or when APIs are not configured
    const isDevOrTest =
      process.env.NODE_ENV === "development" || process.env.USE_MOCK_API === "true" || !process.env.VEHICLE_API_KEY

    const vehicleData = isDevOrTest
      ? await mockVehicleLookup(registration)
      : await lookupVehicleByRegistration(registration)

    if (vehicleData.error) {
      return NextResponse.json(
        {
          error: true,
          message: vehicleData.message || "Vehicle not found",
          registration: registration,
        },
        { status: 404 },
      )
    }

    return NextResponse.json(vehicleData)
  } catch (error) {
    console.error("Vehicle lookup error:", error)

    // Return a fallback response instead of throwing
    return NextResponse.json(
      {
        error: true,
        message: "Vehicle lookup service temporarily unavailable",
        registration: registration,
        // Provide basic fallback data
        make: "Unknown",
        model: "Unknown",
        engineCapacity: "Unknown",
      },
      { status: 503 },
    )
  }
}
