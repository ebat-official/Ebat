import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { comments } from "./comments";
import { posts } from "./posts";

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
