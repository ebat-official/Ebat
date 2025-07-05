import { pgTable, uuid, varchar, uniqueIndex } from "drizzle-orm/pg-core";

// Bookmarks table
export const bookmarks = pgTable(
	"Bookmark",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("userId").notNull(),
		postId: varchar("postId", { length: 21 }).notNull(),
	},
	(table) => ({
		userIdPostIdIdx: uniqueIndex("Bookmark_userId_postId_idx").on(
			table.userId,
			table.postId,
		),
	}),
);
