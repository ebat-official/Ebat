import { pgTable, uuid, varchar, index } from "drizzle-orm/pg-core";
import { voteTypeEnum } from "./enums";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { posts } from "./posts";

// Votes table (for posts)
export const votes = pgTable(
	"vote",
	{
		userId: uuid("userId").notNull(),
		postId: varchar("postId", { length: 21 }).notNull(),
		type: voteTypeEnum("type").notNull(),
	},
	(table) => ({
		pk: { primaryKey: [table.userId, table.postId] },
		postIdTypeIdx: index("vote_postId_type_idx").on(table.postId, table.type),
	}),
);

// Relations
export const votesRelations = relations(votes, ({ one }) => ({
	user: one(users, {
		fields: [votes.userId],
		references: [users.id],
	}),
	post: one(posts, {
		fields: [votes.postId],
		references: [posts.id],
	}),
}));
