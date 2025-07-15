import { index, pgTable, primaryKey, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { voteTypeEnum } from "./enums";
import { posts } from "./posts";

// Votes table (for posts)
export const votes = pgTable(
	"vote",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		postId: varchar("post_id", { length: 21 })
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		type: voteTypeEnum("type").notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.postId] }),
		index("vote_postId_type_idx").on(table.postId, table.type),
	],
);

// Relations
// Relations moved to relations.ts
