export interface Policy {
  id: string
  policyNumber: string
  email: string
  vehicleReg: string
  make: string
  model: string
  year: number
  premium: number
  status: "active" | "expired" | "cancelled" | "pending"
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  createdAt: string
  updatedAt: string
}

export interface Quote {
  id: string
  vehicleReg: string
  make: string
  model: string
  year: number
  premium: number
  email: string
  status: "pending" | "accepted" | "expired"
  createdAt: string
  updatedAt: string
}

export interface Admin {
  id: string
  email: string
  name: string
  role: "admin" | "super_admin"
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: string
  action: string
  userId?: string
  adminId?: string
  details: string
  ipAddress: string
  userAgent: string
  createdAt: string
}

export interface Ticket {
  id: string
  email: string
  subject: string
  message: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  createdAt: string
  updatedAt: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  variables: string[]
  createdAt: string
  updatedAt: string
}

export interface Coupon {
  id: string
  code: string
  type: "percentage" | "fixed"
  value: number
  minAmount?: number
  maxUses?: number
  currentUses: number
  expiresAt?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BlacklistEntry {
  id: string
  email?: string
  ipAddress?: string
  reason: string
  createdAt: string
  updatedAt: string
}

export interface Settings {
  id: string
  key: string
  value: string
  description?: string
  updatedAt: string
}
