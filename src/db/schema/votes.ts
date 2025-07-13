import { pgTable, uuid, varchar, index } from "drizzle-orm/pg-core";
import { voteTypeEnum } from "./enums";
import { user } from "./auth";
import { posts } from "./posts";

// Votes table (for posts)
export const votes = pgTable(
	"vote",
	{
		userId: uuid("user_id").notNull(),
		postId: varchar("post_id", { length: 21 }).notNull(),
		type: voteTypeEnum("type").notNull(),
	},
	(table) => ({
		pk: { primaryKey: [table.userId, table.postId] },
		postIdTypeIdx: index("vote_postId_type_idx").on(table.postId, table.type),
	}),
);

// Relations
// Relations moved to relations.ts
