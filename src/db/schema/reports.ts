import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { posts } from "./posts";
import { comments } from "./comments";

// Reports table
export const reports = pgTable("report", {
	id: uuid("id").primaryKey().defaultRandom(),
	reporterId: uuid("reporter_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	postId: varchar("post_id", { length: 21 }).references(() => posts.id, {
		onDelete: "cascade",
	}),
	commentId: uuid("comment_id").references(() => comments.id, {
		onDelete: "cascade",
	}),
	reason: text("reason").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
// Relations moved to relations.ts
