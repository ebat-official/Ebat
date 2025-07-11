import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { posts } from "./posts";
import { comments } from "./comments";

// Reports table
export const reports = pgTable("Report", {
	id: uuid("id").primaryKey().defaultRandom(),
	reporterId: uuid("reporterId").notNull(),
	postId: varchar("postId", { length: 21 }),
	commentId: uuid("commentId"),
	reason: text("reason").notNull(),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// Relations
export const reportsRelations = relations(reports, ({ one }) => ({
	reporter: one(users, {
		fields: [reports.reporterId],
		references: [users.id],
	}),
	post: one(posts, {
		fields: [reports.postId],
		references: [posts.id],
	}),
	comment: one(comments, {
		fields: [reports.commentId],
		references: [comments.id],
	}),
}));
