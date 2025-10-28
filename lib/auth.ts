import type { NextRequest } from "next/server"
import { createRateLimiter } from "./validation"

// Rate limiters
const loginRateLimit = createRateLimiter(15 * 60 * 1000, 5) // 5 attempts per 15 minutes
const generalRateLimit = createRateLimiter(60 * 1000, 100) // 100 requests per minute

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return "unknown"
}

export function isLoginRateLimited(request: NextRequest): boolean {
  const ip = getClientIP(request)
  return loginRateLimit(ip)
}

export function isGeneralRateLimited(request: NextRequest): boolean {
  const ip = getClientIP(request)
  return generalRateLimit(ip)
}

// Session management
export interface UserSession {
  id: string
  email: string
  isAdmin: boolean
  role?: "Admin" | "Manager"
  loginTime: number
  lastActivity: number
  rememberMe: boolean
}

// In-memory session store (in production, use Redis or database)
const sessions = new Map<string, UserSession>()

export function createSession(
  user: { id: string; email: string; isAdmin: boolean; role?: "Admin" | "Manager" },
  rememberMe = false,
): string {
  const sessionId = generateSessionId()
  const now = Date.now()

  sessions.set(sessionId, {
    ...user,
    loginTime: now,
    lastActivity: now,
    rememberMe,
  })

  return sessionId
}

export function getSession(sessionId: string): UserSession | null {
  const session = sessions.get(sessionId)
  if (!session) return null

  const now = Date.now()
  const maxAge = session.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 days or 24 hours
  const inactivityTimeout = session.isAdmin ? 30 * 60 * 1000 : 2 * 60 * 60 * 1000 // 30 min for admin, 2 hours for users

  // Check if session expired
  if (now - session.loginTime > maxAge || now - session.lastActivity > inactivityTimeout) {
    sessions.delete(sessionId)
    return null
  }

  // Update last activity
  session.lastActivity = now
  return session
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId)
}

export function cleanupExpiredSessions(): void {
  const now = Date.now()

  for (const [sessionId, session] of sessions.entries()) {
    const maxAge = session.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    const inactivityTimeout = session.isAdmin ? 30 * 60 * 1000 : 2 * 60 * 60 * 1000

    if (now - session.loginTime > maxAge || now - session.lastActivity > inactivityTimeout) {
      sessions.delete(sessionId)
    }
  }
}

function generateSessionId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// Audit logging
export interface AuditLog {
  id: string
  userId: string
  userEmail: string
  action: string
  resource: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  timestamp: number
}

// In-memory audit log (in production, use database)
const auditLogs: AuditLog[] = []

export function logAuditEvent(
  user: { id: string; email: string },
  action: string,
  resource: string,
  details: Record<string, any>,
  request: NextRequest,
): void {
  const auditLog: AuditLog = {
    id: generateSessionId(),
    userId: user.id,
    userEmail: user.email,
    action,
    resource,
    details,
    ipAddress: getClientIP(request),
    userAgent: request.headers.get("user-agent") || "unknown",
    timestamp: Date.now(),
  }

  auditLogs.push(auditLog)

  // Keep only last 10000 logs in memory
  if (auditLogs.length > 10000) {
    auditLogs.splice(0, auditLogs.length - 10000)
  }

  // console.log("Audit Log:", auditLog)
}

export function getAuditLogs(limit = 100, offset = 0): AuditLog[] {
  return auditLogs.sort((a, b) => b.timestamp - a.timestamp).slice(offset, offset + limit)
}
