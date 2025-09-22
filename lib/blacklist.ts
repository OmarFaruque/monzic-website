export interface BlacklistEntry {
  id: string
  type: "email" | "phone" | "postcode" | "ip" | "name"
  value: string
  operator: "AND" | "OR"
  reason: string
  createdAt: string
  createdBy: string
}

// Mock blacklist data
const mockBlacklist: BlacklistEntry[] = [
  {
    id: "bl-001",
    type: "email",
    value: "blocked@example.com",
    operator: "OR",
    reason: "Fraudulent activity",
    createdAt: "2025-01-01",
    createdBy: "admin@monzic.com",
  },
  {
    id: "bl-002",
    type: "postcode",
    value: "SW1A1AA",
    operator: "AND",
    reason: "High risk area",
    createdAt: "2025-01-02",
    createdBy: "admin@monzic.com",
  },
]

export function checkBlacklist(
  email?: string,
  phone?: string,
  postcode?: string,
  ip?: string,
  firstName?: string,
  lastName?: string,
): { isBlacklisted: boolean; reason?: string } {
  const entries = mockBlacklist

  // Check each blacklist entry
  for (const entry of entries) {
    let matches = false

    switch (entry.type) {
      case "email":
        matches = email?.toLowerCase() === entry.value.toLowerCase()
        break
      case "phone":
        matches = phone === entry.value
        break
      case "postcode":
        matches = postcode?.replace(/\s/g, "").toLowerCase() === entry.value.replace(/\s/g, "").toLowerCase()
        break
      case "ip":
        matches = ip === entry.value
        break
      case "name":
        const fullName = `${firstName} ${lastName}`.toLowerCase()
        matches = fullName === entry.value.toLowerCase()
        break
    }

    if (matches) {
      return {
        isBlacklisted: true,
        reason: entry.reason,
      }
    }
  }

  return { isBlacklisted: false }
}

export function addToBlacklist(entry: Omit<BlacklistEntry, "id" | "createdAt">): void {
  // In a real app, this would save to database
  console.log("Adding to blacklist:", entry)
}
