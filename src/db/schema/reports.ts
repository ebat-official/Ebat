import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { posts } from "./posts";
import { comments } from "./comments";

// Reports table
export const reports = pgTable("report", {
	id: uuid("id").primaryKey().defaultRandom(),
	reporterId: uuid("reporter_id").notNull(),
	postId: varchar("post_id", { length: 21 }),
	commentId: uuid("comment_id"),
	reason: text("reason").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
// Relations moved to relations.ts
