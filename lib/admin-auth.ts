import { createRateLimiter } from "./validation"

// Rate limiter for admin login attempts
const adminLoginRateLimit = createRateLimiter(15 * 60 * 1000, 3) // 3 attempts per 15 minutes

export interface AdminUser {
  id: string
  email: string
  password: string // In production, this would be hashed
  role: "Admin" | "Manager"
  isActive: boolean
  lastLogin?: number
}

// Mock admin users - In production, store in secure database with hashed passwords
const adminUsers: AdminUser[] = [
  {
    id: "admin1",
    email: "admin@monzic.co.uk",
    password: "MonzicAdmin2024!", // In production: hash this
    role: "Admin",
    isActive: true,
  },
  {
    id: "manager1",
    email: "manager@monzic.co.uk",
    password: "MonzicManager2024!", // In production: hash this
    role: "Manager",
    isActive: true,
  },
]

export function validateAdminCredentials(
  email: string,
  password: string,
  clientIP: string,
): { isValid: boolean; user?: AdminUser; error?: string; rateLimited?: boolean } {
  // Check rate limiting
  if (adminLoginRateLimit(clientIP)) {
    return {
      isValid: false,
      error: "Too many login attempts. Please try again in 15 minutes.",
      rateLimited: true,
    }
  }

  // Find admin user
  const user = adminUsers.find((u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.isActive)

  if (!user) {
    return { isValid: false, error: "Invalid admin credentials" }
  }

  // In production, use bcrypt.compare() for password verification
  if (user.password !== password) {
    return { isValid: false, error: "Invalid admin credentials" }
  }

  // Update last login
  user.lastLogin = Date.now()

  return { isValid: true, user }
}

export function getAdminUsers(): Omit<AdminUser, "password">[] {
  return adminUsers.map(({ password, ...user }) => user)
}

// Demo credentials for testing
export const DEMO_ADMIN_CREDENTIALS = [
  "admin@monzic.co.uk / MonzicAdmin2024!",
  "manager@monzic.co.uk / MonzicManager2024!",
]

export async function isAdminAuthenticated(): Promise<boolean> {
  // In a real application, this would verify a JWT token or session
  // For now, we'll check if there's an admin token in localStorage (client-side)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("adminAuthToken")
    return token !== null
  }

  // Server-side check would verify against database/session store
  return false
}

export function setAdminAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("adminAuthToken", token)
  }
}

export function clearAdminAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("adminAuthToken")
  }
}
