import { z } from "zod"

// Common validation schemas
export const emailSchema = z.string().email("Invalid email address")
export const phoneSchema = z.string().regex(/^(\+44|0)[0-9]{10,11}$/, "Invalid UK phone number")
export const postcodeSchema = z.string().regex(/^[A-Z]{1,2}[0-9R][0-9A-Z]?\s?[0-9][A-Z]{2}$/i, "Invalid UK postcode")
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(50, "Name too long")
  .regex(/^[A-Za-z\s'-]+$/, "Invalid characters in name")

// User registration validation
export const userRegistrationSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    phoneNumber: phoneSchema.optional(),
  })

// Quote form validation
export const quoteFormSchema = z.object({
  firstName: nameSchema,
  middleName: nameSchema.optional(),
  lastName: nameSchema,
  dateOfBirthDay: z.string().regex(/^(0[1-9]|[12][0-9]|3[01])$/, "Invalid day"),
  dateOfBirthMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Invalid month"),
  dateOfBirthYear: z.string().regex(/^(19|20)\d{2}$/, "Invalid year"),
  phoneNumber: phoneSchema,
  occupation: z.string().min(1, "Occupation is required").max(100, "Occupation too long"),
  postcode: postcodeSchema,
  address: z.string().min(1, "Address is required").max(200, "Address too long"),
  licenseType: z.enum(["Full UK License", "Provisional License", "International License", "EU License"]),
  licenseHeld: z.enum(["Under 1 Year", "1-2 Years", "2-4 Years", "5-10 Years", "10+ Years"]),
  vehicleValue: z.enum([
    "£1,000 - £5,000",
    "£5,000 - £10,000",
    "£10,000 - £20,000",
    "£20,000 - £30,000",
    "£30,000 - £50,000",
    "£50,000 - £80,000",
    "£80,000+",
  ]),
  reason: z.enum(["Borrowing", "Buying/Selling/Testing", "Learning", "Maintenance", "Other"]),
  duration: z.string().min(1, "Duration is required"),
  registration: z
    .string()
    .regex(
      /^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$|^[A-Z][0-9]{1,3}\s?[A-Z]{3}$|^[A-Z]{3}\s?[0-9]{1,3}[A-Z]$/,
      "Invalid UK registration",
    ),
})

// Payment validation
export const paymentSchema = z.object({
  cardNumber: z.string().regex(/^[0-9\s]{13,19}$/, "Invalid card number"),
  nameOnCard: nameSchema,
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Invalid month"),
  expiryYear: z.string().regex(/^20[2-9][0-9]$/, "Invalid year"),
  cvv: z.string().regex(/^[0-9]{3,4}$/, "Invalid CVV"),
})

// Contact form validation
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  subject: z.string().min(1, "Subject is required").max(200, "Subject too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message too long"),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        size: z.number().max(10 * 1024 * 1024, "File too large (max 10MB)"),
        type: z.string().regex(/^(image\/(jpeg|jpg|png|gif|webp)|application\/pdf|text\/plain)$/, "Invalid file type"),
      }),
    )
    .max(5, "Maximum 5 attachments allowed")
    .optional(),
})

// Admin validation schemas
export const adminUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  role: z.enum(["Admin", "Manager"]), // Removed 'Support' role
})

export const couponSchema = z.object({
  promoCode: z
    .string()
    .min(3, "Promo code too short")
    .max(20, "Promo code too long")
    .regex(/^[A-Z0-9]+$/, "Invalid characters"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(0.01, "Discount must be positive").max(100, "Invalid discount value"),
  minSpent: z.number().min(0, "Minimum spend cannot be negative").optional(),
  maxDiscount: z.number().min(0, "Maximum discount cannot be negative").optional(),
  quotaAvailable: z.number().int().min(0, "Quota cannot be negative"),
  expires: z.string().datetime("Invalid expiry date"),
  matches: z
    .object({
      lastName: z.string().optional(),
      dateOfBirth: z.string().optional(),
      registrations: z.array(z.string()).optional(),
    })
    .optional(),
})

export const blacklistSchema = z.object({
  lastName: nameSchema.optional(),
  firstName: nameSchema.optional(),
  email: emailSchema.optional(),
  dateOfBirth: z.string().optional(),
  registrations: z.array(z.string()).optional(),
  ipAddress: z.string().ip().optional(),
  deviceId: z.string().optional(),
})

// Validation helper function
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => `${err.path.join(".")}: ${err.message}`),
      }
    }
    return { success: false, errors: ["Validation failed"] }
  }
}

// Sanitization functions
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "")
}

// Rate limiting helper
export function createRateLimiter(windowMs: number, maxRequests: number) {
  const requests = new Map<string, { count: number; resetTime: number }>()

  return {
    limit: function (identifier: string): { success: boolean; remaining: number } {
      const now = Date.now()
      const userRequests = requests.get(identifier)

      if (!userRequests || now > userRequests.resetTime) {
        requests.set(identifier, { count: 1, resetTime: now + windowMs })
        return { success: true, remaining: maxRequests - 1 };
      }

      if (userRequests.count >= maxRequests) {
        return { success: false, remaining: 0 };
      }

      userRequests.count++
      return { success: true, remaining: maxRequests - userRequests.count };
    }
  }
}
