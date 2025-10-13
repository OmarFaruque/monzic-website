// Mock policy database - In production, this would be a real database
export interface PolicyData {
  policyNumber: string
  customerSurname: string
  customerFirstName: string
  customerMiddleName?: string
  dateOfBirth: string // Format: YYYY-MM-DD
  postcode: string
  address: string
  phoneNumber: string
  email: string
  occupation: string
  vehicleReg: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: string
  vehicleValue: string
  policyType: string
  reason: string
  licenseType: string
  licenseHeld: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  premium: number
  createdAt: string
  status: "Active" | "Expired" | "Upcoming"
  ipAddress?: string
  auditLog: AuditEntry[]
}

export interface AuditEntry {
  id: string
  action: "policy_created" | "policy_delivered" | "policy_accessed" | "policy_viewed"
  timestamp: string
  ipAddress?: string
  userAgent?: string
  details?: string
}

export interface CustomerData {
  customerId: string
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phoneNumber: string
  dateOfBirth: string
  address: string
  postcode: string
  occupation: string
  licenseType: string
  licenseHeld: string
  joinDate: string
  totalPolicies: number
  totalSpent: number
  policies: PolicyData[]
}


// Demo credentials for testing
export const DEMO_POLICIES = [
  "POL-001234 - John SMITH, DOB: 15/03/1985, Postcode: SW1A 1AA",
  "POL-001235 - Sarah JOHNSON, DOB: 22/07/1990, Postcode: M1 1AA",
  "POL-001236 - Michael WILLIAMS, DOB: 08/11/1978, Postcode: B1 1AA",
]

// Form options that match the quote form
export const REASON_OPTIONS = ["Borrowing", "Buying/Selling/Testing", "Learning", "Maintenance", "Other"]

export const LICENSE_TYPE_OPTIONS = ["Full UK License", "Provisional License", "International License", "EU License"]

export const LICENSE_HELD_OPTIONS = ["Under 1 Year", "1-2 Years", "2-4 Years", "5-10 Years", "10+ Years"]

export const VEHICLE_VALUE_OPTIONS = [
  "£1,000 - £5,000",
  "£5,000 - £10,000",
  "£10,000 - £20,000",
  "£20,000 - £30,000",
  "£30,000 - £50,000",
  "£50,000 - £80,000",
  "£80,000+",
]
