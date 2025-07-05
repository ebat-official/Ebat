import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

// Reports table
export const reports = pgTable("Report", {
	id: uuid("id").primaryKey().defaultRandom(),
	reporterId: uuid("reporterId").notNull(),
	postId: varchar("postId", { length: 21 }),
	commentId: uuid("commentId"),
	reason: text("reason").notNull(),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
});
