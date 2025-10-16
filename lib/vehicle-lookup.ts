import { lookupVehicleByRegistration, VehicleApiResponse } from "./vehicle-api"

// Vehicle lookup service - simulates DVLA API calls

export interface VehicleData {
  make: string
  model: string
  year: string
  engineSize: string
  fuelType: string
  colour: string
  registrationNumber: string
}

export interface VehicleLookupResult {
  success: boolean
  vehicle?: VehicleData
  error?: string
}

// Simulate API call to lookup vehicle
export const lookupVehicle = async (registration: string): Promise<VehicleLookupResult> => {
  const response: VehicleApiResponse = await lookupVehicleByRegistration(registration)

  if (response.error) {
    return {
      success: false,
      error: response.message || "Vehicle not found in DVLA database",
    }
  }

  return {
    success: true,
    vehicle: {
      make: response.make || "",
      model: response.model || "",
      year: response.year || "",
      engineSize: response.engineCapacity || "",
      fuelType: "", // Not provided by the new API
      colour: response.color || "",
      registrationNumber: response.registration || "",
    },
  }
}
