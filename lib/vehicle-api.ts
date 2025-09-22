import { getAccessToken } from "./auth"

// Define the vehicle data interface
export interface VehicleApiResponse {
  registration: string | null
  make: string | null
  model: string | null
  engineCapacity: string | null
  year?: string | null
  color?: string | null
  error?: boolean
  message?: string
}

// Settings type for admin panel
export type VehicleApiType = "dayinsure" | "mot"

// Get the current API setting from localStorage or default to 'dayinsure'
export const getVehicleApiSetting = (): VehicleApiType => {
  if (typeof window !== "undefined") {
    return (localStorage.getItem("vehicleApiSetting") as VehicleApiType) || "dayinsure"
  }
  return "dayinsure"
}

// Set the API setting in localStorage
export const setVehicleApiSetting = (apiType: VehicleApiType) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("vehicleApiSetting", apiType)
  }
}

// Main function to lookup vehicle by registration
export async function lookupVehicleByRegistration(registration: string): Promise<VehicleApiResponse> {
  try {
    // Clean the registration number (remove spaces)
    const cleanReg = registration.replace(/\s+/g, "").trim().toUpperCase()

    // Get the current API setting
    const apiType = getVehicleApiSetting()

    // Choose API based on setting
    if (apiType === "dayinsure") {
      return await lookupVehicleDayinsure(cleanReg)
    } else {
      return await lookupVehicleMOT(cleanReg)
    }
  } catch (error) {
    console.error("Vehicle lookup error:", error)
    return {
      registration: null,
      make: null,
      model: null,
      engineCapacity: null,
      error: true,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Dayinsure API implementation
async function lookupVehicleDayinsure(registration: string): Promise<VehicleApiResponse> {
  const url = `https://web-api.dayinsure.com/api/v1/vehicle/${registration}`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ errorMessage: "Unknown error" }))
    throw new Error(errorData.errorMessage || `API error: ${response.status}`)
  }

  const data = await response.json()
  const detail = data.detail || {}

  return {
    registration: detail.registration || null,
    make: detail.make || null,
    model: detail.model || null,
    engineCapacity: detail.engineSize || null,
    year: detail.year || null,
    color: detail.colour || null,
  }
}

// MOT API implementation
async function lookupVehicleMOT(registration: string): Promise<VehicleApiResponse> {
  // Get access token (you'll need to implement this based on your auth system)
  const accessToken = await getAccessToken()
  const apiKey = process.env.MOT_API_KEY

  if (!apiKey) {
    throw new Error("MOT API key not configured")
  }

  const url = `https://history.mot.api.gov.uk/v1/trade/vehicles/registration/${encodeURIComponent(registration)}`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-API-Key": apiKey,
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ errorMessage: "Unknown error" }))
    throw new Error(errorData.errorMessage || `API error: ${response.status}`)
  }

  const data = await response.json()

  return {
    registration: data.registration || null,
    make: data.make || null,
    model: data.model || null,
    engineCapacity: data.engineSize || null,
    year: data.yearOfManufacture || null,
    color: data.primaryColour || null,
  }
}

// For development/testing when APIs are not available
export async function mockVehicleLookup(registration: string): Promise<VehicleApiResponse> {
  try {
    // Wait a bit to simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Clean the registration
    const cleanReg = registration.replace(/\s+/g, "").toUpperCase()

    // Demo data based on registration
    const mockData: Record<string, VehicleApiResponse> = {
      LX61JYE: {
        registration: "LX61JYE",
        make: "Volkswagen",
        model: "Golf",
        engineCapacity: "1400",
        year: "2017",
        color: "Silver",
      },
      AB12CDE: {
        registration: "AB12CDE",
        make: "Ford",
        model: "Focus",
        engineCapacity: "1600",
        year: "2018",
        color: "Blue",
      },
    }

    // Return mock data if available
    if (mockData[cleanReg]) {
      return mockData[cleanReg]
    }

    // For testing specific error scenarios
    if (cleanReg === "ERROR" || cleanReg === "TEST") {
      return {
        registration: null,
        make: null,
        model: null,
        engineCapacity: null,
        error: true,
        message: "Vehicle not found",
      }
    }

    // Generate random data for any other registration
    const makes = ["Ford", "Toyota", "BMW", "Audi", "Mercedes", "Volkswagen"]
    const models = ["Focus", "Corolla", "3 Series", "A4", "C-Class", "Golf"]
    const engines = ["1400", "1600", "2000", "1800", "2200", "1200"]
    const colors = ["Red", "Blue", "Black", "White", "Silver", "Grey"]

    return {
      registration: cleanReg,
      make: makes[Math.floor(Math.random() * makes.length)],
      model: models[Math.floor(Math.random() * models.length)],
      engineCapacity: engines[Math.floor(Math.random() * engines.length)],
      year: String(2015 + Math.floor(Math.random() * 8)),
      color: colors[Math.floor(Math.random() * colors.length)],
    }
  } catch (error) {
    console.error("Mock vehicle lookup error:", error)
    return {
      registration: null,
      make: null,
      model: null,
      engineCapacity: null,
      error: true,
      message: "Mock lookup service error",
    }
  }
}
