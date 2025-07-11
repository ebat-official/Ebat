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
import { relations } from "drizzle-orm";
import { voteTypeEnum } from "./enums";
import { users } from "./users";
import { posts } from "./posts";
import { reports } from "./reports";
import { bytea } from "@/db/database-types";

// Comments table
export const comments = pgTable(
	"Comment",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		content: bytea("content"),
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
		authorId: uuid("authorId").notNull(),
		postId: varchar("postId", { length: 21 }).notNull(),
		parentId: uuid("parentId"),
	},
	(table) => [
		index("Comment_postId_parentId_idx").on(table.postId, table.parentId),
		index("Comment_createdAt_idx").on(table.createdAt),
		index("Comment_parentId_idx").on(table.parentId),
		index("Comment_authorId_idx").on(table.authorId),
	],
);

// Comment votes table
export const commentVotes = pgTable(
	"CommentVote",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("userId").notNull(),
		commentId: uuid("commentId").notNull(),
		type: voteTypeEnum("type").notNull(),
	},
	(table) => [
		uniqueIndex("CommentVote_userId_commentId_idx").on(
			table.userId,
			table.commentId,
		),
		index("CommentVote_commentId_type_idx").on(table.commentId, table.type),
	],
);

// Comment mentions table
export const commentMentions = pgTable(
	"CommentMention",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("userId").notNull(),
		commentId: uuid("commentId").notNull(),
		createdAt: timestamp("createdAt").notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex("CommentMention_userId_commentId_idx").on(
			table.userId,
			table.commentId,
		),
		index("CommentMention_commentId_idx").on(table.commentId),
	],
);

// Relations
export const commentsRelations = relations(comments, ({ one, many }) => ({
	author: one(users, {
		fields: [comments.authorId],
		references: [users.id],
	}),
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id],
	}),
	parent: one(comments, {
		fields: [comments.parentId],
		references: [comments.id],
		relationName: "CommentReplies",
	}),
	replies: many(comments, { relationName: "CommentReplies" }),
	votes: many(commentVotes),
	mentions: many(commentMentions),
	reports: many(reports),
}));

export const commentVotesRelations = relations(commentVotes, ({ one }) => ({
	user: one(users, {
		fields: [commentVotes.userId],
		references: [users.id],
	}),
	comment: one(comments, {
		fields: [commentVotes.commentId],
		references: [comments.id],
	}),
}));

export const commentMentionsRelations = relations(
	commentMentions,
	({ one }) => ({
		user: one(users, {
			fields: [commentMentions.userId],
			references: [users.id],
		}),
		comment: one(comments, {
			fields: [commentMentions.commentId],
			references: [comments.id],
			relationName: "CommentMentions",
		}),
	}),
);
