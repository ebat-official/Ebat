import {
	pgTable,
	uuid,
	varchar,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { posts } from "./posts";

// CompletionStatus table
export const completionStatuses = pgTable(
	"CompletionStatus",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("userId").notNull(),
		postId: varchar("postId", { length: 21 }).notNull(),
		completedAt: timestamp("completedAt").notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex("CompletionStatus_userId_postId_idx").on(
			table.userId,
			table.postId,
		),
	],
);

// Relations
export const completionStatusesRelations = relations(
	completionStatuses,
	({ one }) => ({
		user: one(users, {
			fields: [completionStatuses.userId],
			references: [users.id],
		}),
		post: one(posts, {
			fields: [completionStatuses.postId],
			references: [posts.id],
		}),
	}),
);
