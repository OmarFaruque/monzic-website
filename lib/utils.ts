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

export function isValidUKRegistration(registration: string): boolean {
  if (!registration) {
    return false
  }

  // Regular expression for valid UK registration formats
  const ukRegEx = /^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$|^[A-Z][0-9]{1,3}[A-Z]{3}$|^[A-Z]{3}[0-9]{1,3}[A-Z]$|^[0-9]{1,4}[A-Z]{1,2}$|^[A-Z]{1,2}[0-9]{1,4}$|^[A-Z]{1,3}[0-9]{1,3}$/i
  
  return ukRegEx.test(registration.trim())
}
