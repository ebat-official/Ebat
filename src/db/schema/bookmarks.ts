import { pgTable, uuid, varchar, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { posts } from "./posts";

// Bookmarks table
export const bookmarks = pgTable(
	"Bookmark",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("userId").notNull(),
		postId: varchar("postId", { length: 21 }).notNull(),
	},
	(table) => [
		uniqueIndex("Bookmark_userId_postId_idx").on(table.userId, table.postId),
	],
);

// Relations
export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
	user: one(users, {
		fields: [bookmarks.userId],
		references: [users.id],
	}),
	post: one(posts, {
		fields: [bookmarks.postId],
		references: [posts.id],
	}),
}));
