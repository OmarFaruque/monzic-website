import { relations } from "drizzle-orm/relations";
import { tickets, messages } from "../lib/schema";

export const ticketsRelations = relations(tickets, ({ many }) => ({
	messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
	ticket: one(tickets, {
		fields: [messages.ticketId],
		references: [tickets.id],
	}),
}));

