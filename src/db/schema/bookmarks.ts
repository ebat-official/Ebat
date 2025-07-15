import { pgTable, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { posts } from "./posts";

// Bookmarks table
export const bookmarks = pgTable(
	"bookmark",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		postId: varchar("post_id", { length: 21 })
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
	},
	(table) => [
		uniqueIndex("bookmark_userId_postId_idx").on(table.userId, table.postId),
	],
);

// Relations
// Relations moved to relations.ts
