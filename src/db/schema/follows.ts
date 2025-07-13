import {
	pgTable,
	uuid,
	timestamp,
	uniqueIndex,
	index,
} from "drizzle-orm/pg-core";

// Follows table for user relationships
export const follows = pgTable(
	"follow",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		followerId: uuid("follower_id").notNull(),
		followedId: uuid("followed_id").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex("follow_followerId_followedId_idx").on(
			table.followerId,
			table.followedId,
		),
		index("follow_followerId_idx").on(table.followerId),
		index("follow_followedId_idx").on(table.followedId),
	],
);

// Relations moved to relations.ts
