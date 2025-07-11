import {
	pgTable,
	uuid,
	varchar,
	text,
	integer,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

// Account table (OAuth)
export const accounts = pgTable("Account", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("userId").notNull(),
	type: varchar("type", { length: 100 }).notNull(),
	provider: varchar("provider", { length: 100 }).notNull(),
	providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
	refresh_token: text("refresh_token"),
	access_token: text("access_token"),
	expires_at: integer("expires_at"),
	token_type: varchar("token_type", { length: 100 }),
	scope: varchar("scope", { length: 255 }),
	id_token: text("id_token"),
	session_state: varchar("session_state", { length: 255 }),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => [
	uniqueIndex("Account_provider_providerAccountId_idx").on(table.provider, table.providerAccountId),
]);

// VerificationToken table
export const verificationTokens = pgTable("VerificationToken", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	token: varchar("token", { length: 255 }).notNull(),
	expires: timestamp("expires").notNull(),
});

// Relations
export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id],
	}),
}));

// ResetToken table
export const resetTokens = pgTable("ResetToken", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	token: varchar("token", { length: 255 }).notNull(),
	expires: timestamp("expires").notNull(),
});
