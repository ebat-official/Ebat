import { pgTable, uuid, varchar, index } from "drizzle-orm/pg-core";
import { voteTypeEnum } from "./enums";

// Votes table (for posts)
export const votes = pgTable(
	"Vote",
	{
		userId: uuid("userId").notNull(),
		postId: varchar("postId", { length: 21 }).notNull(),
		type: voteTypeEnum("type").notNull(),
	},
	(table) => ({
		pk: { primaryKey: [table.userId, table.postId] },
		postIdTypeIdx: index("Vote_postId_type_idx").on(table.postId, table.type),
	}),
);
