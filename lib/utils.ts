import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidPolicyNumber(policyNumber: string): boolean {
  // Policy number format: POL- followed by 6 digits (e.g., POL-001234)
  const policyRegex = /^POL-\d{6}$/i
  return policyRegex.test(policyNumber.trim())
}
