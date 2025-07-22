import {
	index,
	pgTable,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// Follows table for user relationships
export const follows = pgTable(
	"follow",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		followerId: uuid("follower_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		followedId: uuid("followed_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
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
