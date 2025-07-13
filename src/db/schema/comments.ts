import {
	pgTable,
	uuid,
	varchar,
	text,
	timestamp,
	integer,
	json,
	uniqueIndex,
	index,
} from "drizzle-orm/pg-core";

import { voteTypeEnum } from "./enums";

import { bytea } from "@/db/database-types";

// Comments table
export const comments = pgTable(
	"comment",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		content: bytea("content"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
		authorId: uuid("author_id").notNull(),
		postId: varchar("post_id", { length: 21 }).notNull(),
		parentId: uuid("parent_id"),
	},
	(table) => [
		index("comment_postId_parentId_idx").on(table.postId, table.parentId),
		index("comment_createdAt_idx").on(table.createdAt),
		index("comment_parentId_idx").on(table.parentId),
		index("comment_authorId_idx").on(table.authorId),
	],
);

// Comment votes table
export const commentVotes = pgTable(
	"commentVote",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id").notNull(),
		commentId: uuid("comment_id").notNull(),
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
		userId: uuid("user_id").notNull(),
		commentId: uuid("comment_id").notNull(),
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
