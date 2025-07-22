import {
	pgTable,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { posts } from "./posts";

// CompletionStatus table
export const completionStatuses = pgTable(
	"completionStatus",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		postId: varchar("post_id", { length: 21 })
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		completedAt: timestamp("completed_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		uniqueIndex("completionStatus_userId_postId_idx").on(
			table.userId,
			table.postId,
		),
	],
);

// Relations
// Relations moved to relations.ts
