import { pgTable, unique, serial, varchar, text, timestamp, boolean, json, integer, numeric } from "drizzle-orm/pg-core"
import { min, sql } from "drizzle-orm"
import { PaymentStatus } from "@mollie/api-client";



export const admins = pgTable("admins", {
	adminId: serial("admin_id").primaryKey().notNull(),
	fname: varchar({ length: 255 }),
	lname: varchar({ length: 255 }),
	email: varchar({ length: 255 }),
	phone: varchar({ length: 255 }),
	password: text(),
	role: varchar({ length: 50 }),
	rememberToken: text("remember_token"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("admins_email_unique").on(table.email),
]);

export const users = pgTable("users", {
	userId: serial("user_id").primaryKey().notNull(),
	email: varchar({ length: 255 }),
	stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
	squareCustomerId: varchar("square_customer_id", { length: 255 }),
	emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true, mode: 'string' }),
	password: text(),
	rememberToken: text("remember_token"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	firstName: varchar("first_name", { length: 255 }),
	lastName: varchar("last_name", { length: 255 }),
	verificationCodeHash: text("verification_code_hash"),
	verificationCodeExpiresAt: timestamp("verification_code_expires_at", { withTimezone: true, mode: 'string' }),}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const settings = pgTable('settings', {
  param: text('param').primaryKey(), // e.g., 'mot_token'
  value: text('value'),             // Will store the JSON string with token and timestamp
});

export const quotes = pgTable("quotes", {
	id: serial("id").primaryKey().notNull(),
	policyNumber: varchar("policy_number", { length: 255 }).notNull(),
	userId: varchar("user_id", { length: 255 }),
	cpw: varchar("cpw", { length: 255 }),
	updatePrice: varchar("update_price").default(false),
	regNumber: varchar("reg_number", { length: 50 }),
	vehicleMake: varchar("vehicle_make", { length: 100 }),
	vehicleModel: varchar("vehicle_model", { length: 100 }),
	engineCC: varchar("engine_cc", { length: 50 }),
	startDate: timestamp("start_date", { mode: 'string' }),	
	endDate: timestamp("end_date", { mode: 'string' }),
	dateOfBirth: timestamp("date_of_birth", { mode: 'string' }),
	firstName: varchar("first_name", { length: 100 }),
	lastName: varchar("last_name", { length: 100 }),
	phone: varchar("phone", { length: 50 }),
	licenceType: varchar("licence_type", { length: 50 }),
	licencePeriod: varchar("licence_period", { length: 50 }),
	vehicleType: varchar("vehicle_type", { length: 100 }),
	promoCode: varchar("promo_code", { length: 100 }),
	PaymentStatus: varchar("payment_status", { length: 50 }), // e.g., 'pending', 'paid'
	intentId: varchar("intent_id", { length: 255 }), // Payment intent ID from payment gateway
	spaymentId: varchar("spayment_id", { length: 255 }), // Square payment ID
	nameTitle: varchar("name_title", { length: 20 }),
	postCode: varchar("post_code", { length: 20 }),
	address: text("address"),
	town: varchar("town", { length: 100 }),
	occupation: varchar("occupation", { length: 100 }),
	coverReason: varchar("cover_reason", { length: 255 }),
	mail_sent: boolean("mail_sent").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),	
	quoteData: text("quote_data"), // Storing as JSON string
	status: varchar("status", { length: 50 }).default('pending').notNull(), // e.g., 'pending', 'completed'
	paymentIntentId: varchar("payment_intent_id", { length: 255 }),
	paymentMethod: varchar("payment_method", { length: 50 }), // e.g., 'stripe', 'square'
	expiresAt: timestamp("expires_at", { mode: 'string' })	
});


export const coupons = pgTable("coupons", {
	id: serial("id").primaryKey().notNull(),
	promoCode: varchar("promo_code", { length: 100 }).notNull(),
	discount: json("discount").notNull(), // { type: 'percentage' | 'fixed', value: number }
	minSpent: varchar("min_spent", { length: 50 }), // e.g., '100' for $100
	maxDiscount: varchar("max_discount", { length: 50 }), // e.g., '50' for $50
	quotaAvailable: varchar("quota_available", { length: 50 }).notNull(),
	usedQuota: varchar("used_quota", { length: 50 }).default('0').notNull(),
	totalUsage: varchar("total_usage", { length: 50 }).default('0').notNull(),
	expires: timestamp("expires", { mode: 'string' }),
	isActive: boolean("is_active").default(true).notNull(),
	restrictions: json("restrictions"), // JSON string for any additional restrictions
	matches: json("matches"), // JSON string for matching criteria
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const tickets = pgTable("tickets", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }),
	firstName: varchar("first_name", { length: 255 }).notNull(),
	lastName: varchar("last_name", { length: 255 }).notNull(),
	email: varchar("email", { length: 255 }).notNull(),
	token: varchar("token", { length: 100 }).notNull(),
	policyNumber: varchar("policy_number", { length: 100 }),
	unread: boolean("unread").default(true).notNull(),
	isClosed: boolean("is_closed").default(false).notNull(),
	subject: varchar("subject", { length: 255 }).notNull(),
	status: varchar("status", { length: 50 }).default('open').notNull(), // e.g., 'open', 'closed', 'pending'
	priority: varchar("priority", { length: 50 }).default('normal').notNull(), // e.g., 'low', 'normal', 'high'
	assignedTo: varchar("assigned_to", { length: 255 }), // adminId of the assigned admin
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const messages = pgTable("messages", {
	id: serial("id").primaryKey().notNull(),
	ticketId: integer("ticket_id").references(() => tickets.id).notNull(),
	messageId: varchar("message_id", { length: 255 }).notNull(),
	message: text("message").notNull(),
	isAdmin: boolean("is_admin").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const blacklist = pgTable("blacklist", {
	id: serial("id").primaryKey().notNull(),
	type: varchar("type", { length: 50 }).notNull(), // 'user', 'ip', 'postcode'
	
	// Fields for 'user' type
	firstName: varchar("first_name", { length: 255 }),
	lastName: varchar("last_name", { length: 255 }),
	email: varchar("email", { length: 255 }),
	dateOfBirth: varchar("date_of_birth", { length: 255 }),
	operator: varchar("operator", { length: 10 }).default('AND'), // 'AND' or 'OR'

	// Field for 'ip' type
	ipAddress: varchar("ip_address", { length: 255 }),

	// Field for 'postcode' type
	postcode: varchar("postcode", { length: 50 }),

	// Common fields
	reason: text("reason"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const aiDocuments = pgTable("ai_documents", {
	id: serial("id").primaryKey().notNull(),
	uuid: varchar("uuid", { length: 255 }).notNull(),
	prompt: text("prompt"),
	content: text("content"),
	email: varchar("email", { length: 255 }),
	userId: integer('user_id').notNull(),
	status: varchar("status", { length: 50 }).default('pending'),
	pdfPath: text('pdf_path'),
	amount: numeric('amount'),
	currency: varchar('currency').default('GBP'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});