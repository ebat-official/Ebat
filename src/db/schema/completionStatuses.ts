import {
	pgTable,
	uuid,
	varchar,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { posts } from "./posts";

// CompletionStatus table
export const completionStatuses = pgTable(
	"completionStatus",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id").notNull(),
		postId: varchar("post_id", { length: 21 }).notNull(),
		completedAt: timestamp("completed_at").notNull().defaultNow(),
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
