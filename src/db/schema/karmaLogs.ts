import {
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { comments } from "./comments";
import { posts } from "./posts";

// KarmaLog table
export const karmaLogs = pgTable(
	"karmaLog",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		fromUserId: uuid("from_user_id").references(() => user.id, {
			onDelete: "cascade",
		}),
		action: text("action").notNull(),
		karmaChange: integer("karma_change").notNull(),
		postId: varchar("post_id", { length: 21 }).references(() => posts.id, {
			onDelete: "cascade",
		}),
		commentId: uuid("comment_id").references(() => comments.id, {
			onDelete: "cascade",
		}),
		metadata: jsonb("metadata"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("karmaLog_userId_createdAt_idx").on(table.userId, table.createdAt),
		index("karmaLog_fromUserId_createdAt_idx").on(
			table.fromUserId,
			table.createdAt,
		),
		index("karmaLog_action_createdAt_idx").on(table.action, table.createdAt),
		index("karmaLog_postId_idx").on(table.postId),
		index("karmaLog_commentId_idx").on(table.commentId),
	],
);

// Relations
// Relations moved to relations.ts
