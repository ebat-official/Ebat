import {
	foreignKey,
	index,
	integer,
	json,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
	AnyPgColumn,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { voteTypeEnum } from "./enums";
import { posts } from "./posts";

import { bytea } from "@/db/database-types";
import { desc } from "drizzle-orm";

// Comments table
export const comments = pgTable(
	"comment",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		content: bytea("content"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
		authorId: uuid("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		postId: varchar("post_id", { length: 21 })
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		parentId: uuid("parent_id").references((): AnyPgColumn => comments.id, {
			onDelete: "cascade",
		}),
	},
	(table) => [
		index("comment_postId_parentId_idx").on(table.postId, table.parentId),
		index("comment_createdAt_idx").on(table.createdAt),
		index("comment_parentId_idx").on(table.parentId),
		index("comment_authorId_idx").on(table.authorId),
		index("comment_post_parent_created_idx").on(
			table.postId,
			table.parentId,
			desc(table.createdAt),
		),
		index("comment_post_parent_covering_idx").on(table.postId, table.parentId),
	],
);

// Comment votes table
export const commentVotes = pgTable(
	"commentVote",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		commentId: uuid("comment_id")
			.notNull()
			.references(() => comments.id, { onDelete: "cascade" }),
		type: voteTypeEnum("type").notNull(),
	},
	(table) => [
		uniqueIndex("commentVote_userId_commentId_idx").on(
			table.userId,
			table.commentId,
		),
		index("commentVote_commentId_type_idx").on(table.commentId, table.type),
	],
);

// Comment mentions table
export const commentMentions = pgTable(
	"commentMention",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		commentId: uuid("comment_id")
			.notNull()
			.references(() => comments.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex("commentMention_userId_commentId_idx").on(
			table.userId,
			table.commentId,
		),
		index("commentMention_commentId_idx").on(table.commentId),
	],
);

// Relations moved to relations.ts
