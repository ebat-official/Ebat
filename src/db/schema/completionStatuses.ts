import {
	pgTable,
	uuid,
	varchar,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

// CompletionStatus table
export const completionStatuses = pgTable(
	"CompletionStatus",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("userId").notNull(),
		postId: varchar("postId", { length: 21 }).notNull(),
		completedAt: timestamp("completedAt").notNull().defaultNow(),
	},
	(table) => ({
		userIdPostIdIdx: uniqueIndex("CompletionStatus_userId_postId_idx").on(
			table.userId,
			table.postId,
		),
	}),
);
