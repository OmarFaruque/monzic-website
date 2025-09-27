import { pgTable, unique, serial, varchar, text, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



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
	emailVerifiedAt: timestamp("email_verified_at", { mode: 'string' }),
	password: text(),
	rememberToken: text("remember_token"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	firstName: varchar("first_name", { length: 255 }),
	lastName: varchar("last_name", { length: 255 }),
	verificationCodeHash: text("verification_code_hash"),
	verificationCodeExpiresAt: timestamp("verification_code_expires_at", { mode: 'string' }),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const settings = pgTable('settings', {
  param: text('param').primaryKey(), // e.g., 'mot_token'
  value: text('value'),             // Will store the JSON string with token and timestamp
});
