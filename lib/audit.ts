export interface AuditEntry {
  id: string
  action: "policy_created" | "policy_delivered" | "policy_accessed" | "policy_viewed" | "email_sent"
  timestamp: string
  ipAddress?: string
  userAgent?: string
  details?: string
  policyNumber?: string
  customerEmail?: string
}

// In-memory audit log storage (in production, use database)
const auditLogs: AuditEntry[] = []

export function logAuditEntry(entry: Omit<AuditEntry, "id" | "timestamp">) {
  const auditEntry: AuditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  }

  auditLogs.push(auditEntry)

  // Keep only last 10000 entries in memory
  if (auditLogs.length > 10000) {
    auditLogs.splice(0, auditLogs.length - 10000)
  }

  console.log("Audit Entry:", auditEntry)
  return auditEntry
}

export function getAuditLogs(filters?: {
  policyNumber?: string
  customerEmail?: string
  action?: string
  limit?: number
}): AuditEntry[] {
  let filtered = auditLogs

  if (filters?.policyNumber) {
    filtered = filtered.filter((log) => log.policyNumber === filters.policyNumber)
  }

  if (filters?.customerEmail) {
    filtered = filtered.filter((log) => log.customerEmail === filters.customerEmail)
  }

  if (filters?.action) {
    filtered = filtered.filter((log) => log.action === filters.action)
  }

  return filtered
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, filters?.limit || 100)
}

export function logPolicyCreated(policyNumber: string, customerEmail: string, ipAddress?: string, userAgent?: string) {
  return logAuditEntry({
    action: "policy_created",
    policyNumber,
    customerEmail,
    ipAddress,
    userAgent,
    details: "Policy created via web interface",
  })
}

export function logPolicyDelivered(policyNumber: string, customerEmail: string) {
  return logAuditEntry({
    action: "policy_delivered",
    policyNumber,
    customerEmail,
    details: "Policy document delivered via email",
  })
}

export function logPolicyAccessed(policyNumber: string, customerEmail: string, ipAddress?: string, userAgent?: string) {
  return logAuditEntry({
    action: "policy_accessed",
    policyNumber,
    customerEmail,
    ipAddress,
    userAgent,
    details: "Customer accessed policy via login",
  })
}

export function logPolicyViewed(policyNumber: string, customerEmail: string, ipAddress?: string, userAgent?: string) {
  return logAuditEntry({
    action: "policy_viewed",
    policyNumber,
    customerEmail,
    ipAddress,
    userAgent,
    details: "Customer viewed policy document",
  })
}

export function logEmailSent(customerEmail: string, subject: string, details?: string) {
  return logAuditEntry({
    action: "email_sent",
    customerEmail,
    details: `Email sent: ${subject}${details ? ` - ${details}` : ""}`,
  })
}
