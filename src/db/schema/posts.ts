import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { bytea } from "@/db/database-types";
import { user } from "./auth";
import {
	Difficulty,
	PostApprovalStatus,
	PostCategory,
	PostStatus,
	PostType,
	SubCategory,
	difficultyEnum,
	postApprovalStatusEnum,
	postCategoryEnum,
	postStatusEnum,
	postTypeEnum,
	subCategoryEnum,
} from "./enums";

// Posts table
export const posts = pgTable(
	"post",
	{
		id: varchar("id", { length: 21 }).primaryKey(), // nanoid format
		title: varchar("title", { length: 500 }),
		slug: varchar("slug", { length: 255 }),
		thumbnail: varchar("thumbnail", { length: 500 }),
		content: bytea("content"), // Binary field for compressed content (pako compressed)
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		authorId: uuid("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: postTypeEnum("type").notNull(),
		difficulty: difficultyEnum("difficulty"),
		companies: varchar("companies", { length: 255 }).array().default([]),
		completionDuration: integer("completion_duration"),
		coins: integer("coins").default(0),
		topics: varchar("topics", { length: 255 }).array().default([]),
		category: postCategoryEnum("category").notNull(),
		subCategory: subCategoryEnum("sub_category").notNull(),
		status: postStatusEnum("status").notNull().default(PostStatus.DRAFT),
		approvalStatus: postApprovalStatusEnum("approval_status")
			.notNull()
			.default(PostApprovalStatus.PENDING),
		logs: jsonb("logs"), // Array of logs
	},
	(table) => [
		index("post_authorId_idx").on(table.authorId),
		index("post_slug_idx").on(table.slug),
		index("post_type_idx").on(table.type),
		index("post_category_idx").on(table.category),
		index("post_subCategory_idx").on(table.subCategory),
		index("post_status_idx").on(table.status),
		index("post_approvalStatus_idx").on(table.approvalStatus),
		// Add the GIN index for full-text search
		index("post_full_search_idx").using(
			"gin",
			sql`(
				setweight(to_tsvector('english', ${table.title}), 'A')
			)`,
		),
	],
);

// Post views table
export const postViews = pgTable("postViews", {
	postId: varchar("post_id", { length: 21 })
		.primaryKey()
		.references(() => posts.id, { onDelete: "cascade" }),
	count: integer("count").notNull().default(0),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// Post edits table
export const postEdits = pgTable(
	"postEdit",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		postId: varchar("post_id", { length: 21 })
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		authorId: uuid("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		content: bytea("content"), // Binary field for compressed content (pako compressed)
		approvalStatus: postApprovalStatusEnum("approval_status")
			.notNull()
			.default(PostApprovalStatus.PENDING),
		logs: jsonb("logs"), // Array of logs
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		title: varchar("title", { length: 500 }),
		type: postTypeEnum("type").notNull(),
		difficulty: difficultyEnum("difficulty"),
		companies: varchar("companies", { length: 255 }).array().default([]),
		completionDuration: integer("completion_duration"),
		topics: varchar("topics", { length: 255 }).array().default([]),
		thumbnail: varchar("thumbnail", { length: 500 }),
		category: postCategoryEnum("category").notNull(),
		subCategory: subCategoryEnum("sub_category").notNull(),
		status: postStatusEnum("status").notNull().default(PostStatus.DRAFT),
	},
	(table) => [
		index("postEdit_postId_idx").on(table.postId),
		index("postEdit_authorId_idx").on(table.authorId),
		index("postEdit_approvalStatus_idx").on(table.approvalStatus),
		// Composite unique constraint
		uniqueIndex("postEdit_postId_authorId").on(table.postId, table.authorId),
	],
);

// Post collaborators (many-to-many relationship)
export const postCollaborators = pgTable(
	"postCollaborators",
	{
		postId: varchar("post_id", { length: 21 })
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [
		uniqueIndex("postCollaborators_postId_userId_idx").on(
			table.postId,
			table.userId,
		),
		index("postCollaborators_postId_idx").on(table.postId),
		index("postCollaborators_userId_idx").on(table.userId),
	],
);

// Relations moved to relations.ts
