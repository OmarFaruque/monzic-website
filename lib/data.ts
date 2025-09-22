import type { Policy, User, Quote } from "./definitions"

// Mock data for development - replace with actual database calls in production
const mockPolicies: Policy[] = [
  // Policies for user@monzic.com
  {
    id: "1",
    policyNumber: "POL-001234",
    email: "user@monzic.com",
    vehicleReg: "AB12 CDE",
    make: "Ford",
    model: "Focus",
    year: 2020,
    premium: 450.0,
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    policyNumber: "POL-001235",
    email: "user@monzic.com",
    vehicleReg: "FG34 HIJ",
    make: "Toyota",
    model: "Corolla",
    year: 2019,
    premium: 380.0,
    status: "active",
    startDate: "2024-02-01",
    endDate: "2025-01-31",
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "3",
    policyNumber: "POL-002468",
    email: "user@monzic.com",
    vehicleReg: "LM56 NOP",
    make: "BMW",
    model: "3 Series",
    year: 2021,
    premium: 650.0,
    status: "active",
    startDate: "2024-03-15",
    endDate: "2025-03-14",
    createdAt: "2024-03-15T00:00:00Z",
    updatedAt: "2024-03-15T00:00:00Z",
  },
  {
    id: "4",
    policyNumber: "POL-003579",
    email: "user@monzic.com",
    vehicleReg: "QR78 STU",
    make: "Audi",
    model: "A4",
    year: 2018,
    premium: 520.0,
    status: "expired",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "5",
    policyNumber: "POL-004680",
    email: "user@monzic.com",
    vehicleReg: "VW90 XYZ",
    make: "Mercedes",
    model: "C-Class",
    year: 2022,
    premium: 780.0,
    status: "pending",
    startDate: "2024-06-01",
    endDate: "2025-05-31",
    createdAt: "2024-05-15T00:00:00Z",
    updatedAt: "2024-05-15T00:00:00Z",
  },
  // Policies for test@monzic.com
  {
    id: "6",
    policyNumber: "POL-100001",
    email: "test@monzic.com",
    vehicleReg: "TE12 STR",
    make: "Honda",
    model: "Civic",
    year: 2020,
    premium: 320.0,
    status: "active",
    startDate: "2024-01-15",
    endDate: "2025-01-14",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "7",
    policyNumber: "POL-100002",
    email: "test@monzic.com",
    vehicleReg: "TE34 STR",
    make: "Nissan",
    model: "Qashqai",
    year: 2019,
    premium: 410.0,
    status: "expired",
    startDate: "2023-06-01",
    endDate: "2024-05-31",
    createdAt: "2023-06-01T00:00:00Z",
    updatedAt: "2023-06-01T00:00:00Z",
  },
  // Policies for other users
  {
    id: "8",
    policyNumber: "POL-005791",
    email: "jane.smith@example.com",
    vehicleReg: "AB12 XYZ",
    make: "Volkswagen",
    model: "Golf",
    year: 2021,
    premium: 420.0,
    status: "active",
    startDate: "2024-04-01",
    endDate: "2025-03-31",
    createdAt: "2024-04-01T00:00:00Z",
    updatedAt: "2024-04-01T00:00:00Z",
  },
]

const mockUsers: User[] = [
  {
    id: "1",
    email: "john.doe@example.com",
    name: "John Doe",
    phone: "+44 7123 456789",
    address: "123 Main St, London, UK",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "user@monzic.com",
    name: "Test User",
    phone: "+44 7987 654321",
    address: "456 High Street, Manchester, UK",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "3",
    email: "test@monzic.com",
    name: "Demo User",
    phone: "+44 7555 123456",
    address: "789 Test Avenue, Birmingham, UK",
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
  },
]

const mockQuotes: Quote[] = [
  {
    id: "1",
    vehicleReg: "AB12 CDE",
    make: "Ford",
    model: "Focus",
    year: 2020,
    premium: 450.0,
    email: "user@monzic.com",
    status: "accepted",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    vehicleReg: "FG34 HIJ",
    make: "Toyota",
    model: "Corolla",
    year: 2019,
    premium: 380.0,
    email: "user@monzic.com",
    status: "accepted",
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "3",
    vehicleReg: "LM56 NOP",
    make: "BMW",
    model: "3 Series",
    year: 2021,
    premium: 650.0,
    email: "user@monzic.com",
    status: "accepted",
    createdAt: "2024-03-15T00:00:00Z",
    updatedAt: "2024-03-15T00:00:00Z",
  },
  {
    id: "4",
    vehicleReg: "QR78 STU",
    make: "Audi",
    model: "A4",
    year: 2018,
    premium: 520.0,
    email: "user@monzic.com",
    status: "expired",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "5",
    vehicleReg: "VW90 XYZ",
    make: "Mercedes",
    model: "C-Class",
    year: 2022,
    premium: 780.0,
    email: "user@monzic.com",
    status: "pending",
    createdAt: "2024-05-15T00:00:00Z",
    updatedAt: "2024-05-15T00:00:00Z",
  },
  {
    id: "6",
    vehicleReg: "TE12 STR",
    make: "Honda",
    model: "Civic",
    year: 2020,
    premium: 320.0,
    email: "test@monzic.com",
    status: "accepted",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
]

// Policy functions
export async function getPolicy(policyNumber: string): Promise<Policy | undefined> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return mockPolicies.find((policy) => policy.policyNumber === policyNumber)
}

export async function getPolicies(): Promise<Policy[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockPolicies
}

export async function getPoliciesByEmail(email: string): Promise<Policy[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockPolicies.filter((policy) => policy.email === email)
}

export async function createPolicy(policyData: Omit<Policy, "id" | "createdAt" | "updatedAt">): Promise<Policy> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newPolicy: Policy = {
    ...policyData,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  mockPolicies.push(newPolicy)
  return newPolicy
}

export async function updatePolicy(policyNumber: string, updates: Partial<Policy>): Promise<Policy | null> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const policyIndex = mockPolicies.findIndex((p) => p.policyNumber === policyNumber)
  if (policyIndex === -1) return null

  mockPolicies[policyIndex] = {
    ...mockPolicies[policyIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  return mockPolicies[policyIndex]
}

// User functions
export async function getUser(email: string): Promise<User | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockUsers.find((user) => user.email === email)
}

export async function createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newUser: User = {
    ...userData,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  mockUsers.push(newUser)
  return newUser
}

export async function updateUser(email: string, updates: Partial<User>): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const userIndex = mockUsers.findIndex((u) => u.email === email)
  if (userIndex === -1) return null

  mockUsers[userIndex] = {
    ...mockUsers[userIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  return mockUsers[userIndex]
}

// Quote functions
export async function getQuote(id: string): Promise<Quote | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockQuotes.find((quote) => quote.id === id)
}

export async function getQuotes(): Promise<Quote[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockQuotes
}

export async function getQuotesByEmail(email: string): Promise<Quote[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockQuotes.filter((quote) => quote.email === email)
}

export async function createQuote(quoteData: Omit<Quote, "id" | "createdAt" | "updatedAt">): Promise<Quote> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newQuote: Quote = {
    ...quoteData,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  mockQuotes.push(newQuote)
  return newQuote
}

export async function updateQuote(id: string, updates: Partial<Quote>): Promise<Quote | null> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const quoteIndex = mockQuotes.findIndex((q) => q.id === id)
  if (quoteIndex === -1) return null

  mockQuotes[quoteIndex] = {
    ...mockQuotes[quoteIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  return mockQuotes[quoteIndex]
}

// Analytics functions
export async function getAnalytics() {
  await new Promise((resolve) => setTimeout(resolve, 300))

  return {
    totalPolicies: mockPolicies.length,
    activePolicies: mockPolicies.filter((p) => p.status === "active").length,
    totalUsers: mockUsers.length,
    totalQuotes: mockQuotes.length,
    pendingQuotes: mockQuotes.filter((q) => q.status === "pending").length,
    totalRevenue: mockPolicies.reduce((sum, p) => sum + p.premium, 0),
    monthlyRevenue: mockPolicies
      .filter((p) => new Date(p.createdAt).getMonth() === new Date().getMonth())
      .reduce((sum, p) => sum + p.premium, 0),
  }
}
