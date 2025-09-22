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

// Mock policy data with complete information
const mockPolicies: PolicyData[] = [
  {
    policyNumber: "POL-001234",
    customerSurname: "SMITH",
    customerFirstName: "John",
    customerMiddleName: "",
    dateOfBirth: "1985-03-15",
    postcode: "SW1A1AA",
    address: "123 Main Street, London, SW1A 1AA",
    phoneNumber: "07123456789",
    email: "john.smith@email.com",
    occupation: "Accountant",
    vehicleReg: "AB12CDE",
    vehicleMake: "Volkswagen",
    vehicleModel: "Golf",
    vehicleYear: "2017",
    vehicleValue: "£10,000 - £20,000",
    policyType: "Comprehensive",
    reason: "Borrowing",
    licenseType: "Full UK License",
    licenseHeld: "10+ Years",
    startDate: "2025-06-10",
    endDate: "2025-06-11",
    startTime: "21:30",
    endTime: "22:30",
    premium: 15.97,
    createdAt: "2025-01-04 10:30",
    status: "Upcoming",
    ipAddress: "192.168.1.100",
    auditLog: [
      {
        id: "audit-001",
        action: "policy_created",
        timestamp: "2025-01-04 10:30:00",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0...",
        details: "Policy created via web interface",
      },
      {
        id: "audit-002",
        action: "policy_delivered",
        timestamp: "2025-01-04 10:31:00",
        details: "Policy document delivered via email",
      },
    ],
  },
  {
    policyNumber: "POL-001235",
    customerSurname: "JOHNSON",
    customerFirstName: "Sarah",
    dateOfBirth: "1990-07-22",
    postcode: "M11AA",
    address: "456 Oak Avenue, Manchester, M1 1AA",
    phoneNumber: "07987654321",
    email: "sarah.j@email.com",
    occupation: "Teacher",
    vehicleReg: "FG34HIJ",
    vehicleMake: "BMW",
    vehicleModel: "3 Series",
    vehicleYear: "2019",
    vehicleValue: "£20,000 - £30,000",
    policyType: "Third Party",
    reason: "Test Drive",
    licenseType: "Full UK License",
    licenseHeld: "5-10 Years",
    startDate: "2025-06-01",
    endDate: "2025-06-07",
    startTime: "09:00",
    endTime: "18:00",
    premium: 25.5,
    createdAt: "2025-01-04 14:15",
    status: "Upcoming",
    ipAddress: "192.168.1.101",
    auditLog: [
      {
        id: "audit-003",
        action: "policy_created",
        timestamp: "2025-01-04 14:15:00",
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0...",
        details: "Policy created via web interface",
      },
      {
        id: "audit-004",
        action: "policy_delivered",
        timestamp: "2025-01-04 14:16:00",
        details: "Policy document delivered via email",
      },
    ],
  },
  {
    policyNumber: "POL-001236",
    customerSurname: "WILLIAMS",
    customerFirstName: "Michael",
    dateOfBirth: "1978-11-08",
    postcode: "B11AA",
    address: "789 Pine Road, Birmingham, B1 1AA",
    phoneNumber: "07555123456",
    email: "mike.w@email.com",
    occupation: "Engineer",
    vehicleReg: "KL56MNO",
    vehicleMake: "Audi",
    vehicleModel: "A4",
    vehicleYear: "2020",
    vehicleValue: "£30,000 - £50,000",
    policyType: "Comprehensive",
    reason: "Borrowing",
    licenseType: "Full UK License",
    licenseHeld: "10+ Years",
    startDate: "2025-05-02",
    endDate: "2025-05-03",
    startTime: "10:00",
    endTime: "16:00",
    premium: 18.75,
    createdAt: "2025-01-02 09:45",
    status: "Expired",
    ipAddress: "192.168.1.102",
    auditLog: [
      {
        id: "audit-005",
        action: "policy_created",
        timestamp: "2025-01-02 09:45:00",
        ipAddress: "192.168.1.102",
        userAgent: "Mozilla/5.0...",
        details: "Policy created via web interface",
      },
      {
        id: "audit-006",
        action: "policy_delivered",
        timestamp: "2025-01-02 09:46:00",
        details: "Policy document delivered via email",
      },
    ],
  },
  // Additional policy for John Smith
  {
    policyNumber: "POL-001237",
    customerSurname: "SMITH",
    customerFirstName: "John",
    customerMiddleName: "",
    dateOfBirth: "1985-03-15",
    postcode: "SW1A1AA",
    address: "123 Main Street, London, SW1A 1AA",
    phoneNumber: "07123456789",
    email: "john.smith@email.com",
    occupation: "Accountant",
    vehicleReg: "CD78EFG",
    vehicleMake: "Ford",
    vehicleModel: "Focus",
    vehicleYear: "2018",
    vehicleValue: "£5,000 - £10,000",
    policyType: "Third Party",
    reason: "Learning",
    licenseType: "Full UK License",
    licenseHeld: "10+ Years",
    startDate: "2024-12-15",
    endDate: "2024-12-16",
    startTime: "14:00",
    endTime: "18:00",
    premium: 22.5,
    createdAt: "2024-12-14 16:20",
    status: "Expired",
    ipAddress: "192.168.1.100",
    auditLog: [
      {
        id: "audit-007",
        action: "policy_created",
        timestamp: "2024-12-14 16:20:00",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0...",
        details: "Policy created via web interface",
      },
      {
        id: "audit-008",
        action: "policy_delivered",
        timestamp: "2024-12-14 16:21:00",
        details: "Policy document delivered via email",
      },
    ],
  },
]

export function validatePolicyAccess(
  policyNumber: string,
  surname: string,
  dateOfBirth: string, // Format: YYYY-MM-DD
  postcode: string,
): { isValid: boolean; policy?: PolicyData; error?: string } {
  // Find the policy
  const policy = mockPolicies.find((p) => p.policyNumber.toLowerCase() === policyNumber.toLowerCase())

  if (!policy) {
    return { isValid: false, error: "Policy not found" }
  }

  // Validate surname (case insensitive)
  if (policy.customerSurname.toLowerCase() !== surname.toLowerCase().trim()) {
    return { isValid: false, error: "Surname does not match our records" }
  }

  // Validate date of birth
  if (policy.dateOfBirth !== dateOfBirth) {
    return { isValid: false, error: "Date of birth does not match our records" }
  }

  // Validate postcode (remove spaces and compare case insensitive)
  const normalizePostcode = (pc: string) => pc.replace(/\s/g, "").toLowerCase()
  if (normalizePostcode(policy.postcode) !== normalizePostcode(postcode)) {
    return { isValid: false, error: "Postcode does not match our records" }
  }

  return { isValid: true, policy }
}

export function getPolicyByNumber(policyNumber: string): PolicyData | null {
  return mockPolicies.find((p) => p.policyNumber.toLowerCase() === policyNumber.toLowerCase()) || null
}

export function getAllPolicies(): PolicyData[] {
  return mockPolicies
}

export function getCustomerData(): CustomerData[] {
  // Group policies by customer
  const customerMap = new Map<string, CustomerData>()

  mockPolicies.forEach((policy) => {
    const customerKey = `${policy.customerFirstName}_${policy.customerSurname}_${policy.dateOfBirth}`

    if (!customerMap.has(customerKey)) {
      customerMap.set(customerKey, {
        customerId: customerKey,
        firstName: policy.customerFirstName,
        middleName: policy.customerMiddleName,
        lastName: policy.customerSurname,
        email: policy.email,
        phoneNumber: policy.phoneNumber,
        dateOfBirth: policy.dateOfBirth,
        address: policy.address,
        postcode: policy.postcode,
        occupation: policy.occupation,
        licenseType: policy.licenseType,
        licenseHeld: policy.licenseHeld,
        joinDate: policy.createdAt.split(" ")[0], // Extract date part
        totalPolicies: 0,
        totalSpent: 0,
        policies: [],
      })
    }

    const customer = customerMap.get(customerKey)!
    customer.policies.push(policy)
    customer.totalPolicies++
    customer.totalSpent += policy.premium
  })

  return Array.from(customerMap.values())
}

export function getCustomerById(customerId: string): CustomerData | null {
  const customers = getCustomerData()
  return customers.find((c) => c.customerId === customerId) || null
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
