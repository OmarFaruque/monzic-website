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

// Mock vehicle database - simulates DVLA data
const mockVehicleDatabase: Record<string, VehicleData> = {
  // Current format (2001-present): AB12 CDE
  LX61JYE: {
    make: "Volkswagen",
    model: "Golf",
    year: "2017",
    engineSize: "1400cc",
    fuelType: "Petrol",
    colour: "Silver",
    registrationNumber: "LX61 JYE",
  },
  FG34HIJ: {
    make: "BMW",
    model: "3 Series",
    year: "2019",
    engineSize: "2000cc",
    fuelType: "Diesel",
    colour: "Black",
    registrationNumber: "FG34 HIJ",
  },
  KL56MNO: {
    make: "Audi",
    model: "A4",
    year: "2020",
    engineSize: "1800cc",
    fuelType: "Petrol",
    colour: "White",
    registrationNumber: "KL56 MNO",
  },
  CD78EFG: {
    make: "Ford",
    model: "Focus",
    year: "2018",
    engineSize: "1600cc",
    fuelType: "Petrol",
    colour: "Blue",
    registrationNumber: "CD78 EFG",
  },
  MN90PQR: {
    make: "Toyota",
    model: "Corolla",
    year: "2021",
    engineSize: "1200cc",
    fuelType: "Hybrid",
    colour: "Red",
    registrationNumber: "MN90 PQR",
  },
  ST12UVW: {
    make: "Mercedes-Benz",
    model: "C-Class",
    year: "2020",
    engineSize: "2200cc",
    fuelType: "Diesel",
    colour: "Grey",
    registrationNumber: "ST12 UVW",
  },
  XY34ZAB: {
    make: "Nissan",
    model: "Qashqai",
    year: "2019",
    engineSize: "1500cc",
    fuelType: "Petrol",
    colour: "Green",
    registrationNumber: "XY34 ZAB",
  },
}

// Normalize registration number for lookup (remove spaces, convert to uppercase)
const normalizeRegistration = (reg: string): string => {
  return reg.replace(/\s+/g, "").toUpperCase()
}

// Validate UK registration format
export const isValidUKRegistration = (reg: string): boolean => {
  const normalized = normalizeRegistration(reg)

  // Current format (2001-present): AB12CDE
  const currentFormat = /^[A-Z]{2}[0-9]{2}[A-Z]{3}$/

  // Prefix format (1983-2001): A123BCD
  const prefixFormat = /^[A-Z][0-9]{1,3}[A-Z]{3}$/

  // Suffix format (1963-1983): ABC123D
  const suffixFormat = /^[A-Z]{3}[0-9]{1,3}[A-Z]$/

  // Dateless format (1903-1963): ABC123
  const datelessFormat = /^[A-Z]{1,3}[0-9]{1,4}$/

  return (
    currentFormat.test(normalized) ||
    prefixFormat.test(normalized) ||
    suffixFormat.test(normalized) ||
    datelessFormat.test(normalized)
  )
}

// Simulate API call to lookup vehicle
export const lookupVehicle = async (registration: string): Promise<VehicleLookupResult> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const normalizedReg = normalizeRegistration(registration)

  // Check if vehicle exists in our mock database
  const vehicle = mockVehicleDatabase[normalizedReg]

  if (vehicle) {
    return {
      success: true,
      vehicle,
    }
  } else {
    return {
      success: false,
      error: "Vehicle not found in DVLA database",
    }
  }
}

// Demo registrations for testing
export const DEMO_REGISTRATIONS = [
  "LX61 JYE - Volkswagen Golf 2017",
  "FG34 HIJ - BMW 3 Series 2019",
  "KL56 MNO - Audi A4 2020",
  "CD78 EFG - Ford Focus 2018",
  "MN90 PQR - Toyota Corolla 2021",
  "ST12 UVW - Mercedes-Benz C-Class 2020",
  "XY34 ZAB - Nissan Qashqai 2019",
]

// Get all available registrations (for admin purposes)
export const getAllRegistrations = (): string[] => {
  return Object.keys(mockVehicleDatabase)
}

// Add new vehicle to database (for admin purposes)
export const addVehicle = (registration: string, vehicleData: Omit<VehicleData, "registrationNumber">): boolean => {
  const normalizedReg = normalizeRegistration(registration)

  if (mockVehicleDatabase[normalizedReg]) {
    return false // Vehicle already exists
  }

  mockVehicleDatabase[normalizedReg] = {
    ...vehicleData,
    registrationNumber: registration,
  }

  return true
}
