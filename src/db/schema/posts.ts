import {
	pgTable,
	uuid,
	varchar,
	text,
	timestamp,
	integer,
	json,
	boolean,
	uniqueIndex,
	index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
	postTypeEnum,
	difficultyEnum,
	postCategoryEnum,
	postStatusEnum,
	postApprovalStatusEnum,
	subCategoryEnum,
} from "./enums";

// Posts table
export const posts = pgTable(
	"Post",
	{
		id: varchar("id", { length: 21 }).primaryKey(), // nanoid format
		title: varchar("title", { length: 500 }),
		slug: varchar("slug", { length: 255 }),
		thumbnail: varchar("thumbnail", { length: 500 }),
		content: text("content"), // Text field for compressed content (will be handled as bytes in application)
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
		authorId: uuid("authorId").notNull(),
		type: postTypeEnum("type").notNull(),
		difficulty: difficultyEnum("difficulty"),
		companies: varchar("companies", { length: 255 }).array().default([]),
		completionDuration: integer("completionDuration"),
		coins: integer("coins").default(0),
		topics: varchar("topics", { length: 255 }).array().default([]),
		category: postCategoryEnum("category").notNull(),
		subCategory: subCategoryEnum("subCategory").notNull(),
		status: postStatusEnum("status").notNull().default("DRAFT"),
		approvalStatus: postApprovalStatusEnum("approvalStatus")
			.notNull()
			.default("PENDING"),
		approvalLogs: json("approvalLogs"), // Array of approval/rejection logs
	},
	(table) => ({
		authorIdIdx: index("Post_authorId_idx").on(table.authorId),
		slugIdx: index("Post_slug_idx").on(table.slug),
		typeIdx: index("Post_type_idx").on(table.type),
		categoryIdx: index("Post_category_idx").on(table.category),
		subCategoryIdx: index("Post_subCategory_idx").on(table.subCategory),
		statusIdx: index("Post_status_idx").on(table.status),
		approvalStatusIdx: index("Post_approvalStatus_idx").on(
			table.approvalStatus,
		),
		createdAtIdx: index("Post_createdAt_idx").on(table.createdAt),
		// Composite unique constraint
		idSlugIdx: uniqueIndex("PostIdSlug").on(table.id, table.slug),
	}),
);

// Post views table
export const postViews = pgTable("PostViews", {
	postId: varchar("postId", { length: 21 }).primaryKey(),
	count: integer("count").notNull().default(0),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Post edits table
export const postEdits = pgTable(
	"PostEdit",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		postId: varchar("postId", { length: 21 }).notNull(),
		authorId: uuid("authorId").notNull(),
		content: text("content"), // Text field for compressed content (will be handled as bytes in application)
		approvalStatus: postApprovalStatusEnum("approvalStatus")
			.notNull()
			.default("PENDING"),
		approvalLogs: json("approvalLogs"), // Array of approval/rejection logs
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
		title: varchar("title", { length: 500 }),
		type: postTypeEnum("type").notNull(),
		difficulty: difficultyEnum("difficulty"),
		companies: varchar("companies", { length: 255 }).array().default([]),
		completionDuration: integer("completionDuration"),
		topics: varchar("topics", { length: 255 }).array().default([]),
	},
	(table) => ({
		postIdIdx: index("PostEdit_postId_idx").on(table.postId),
		authorIdIdx: index("PostEdit_authorId_idx").on(table.authorId),
		approvalStatusIdx: index("PostEdit_approvalStatus_idx").on(
			table.approvalStatus,
		),
		// Composite unique constraint
		postIdAuthorIdIdx: uniqueIndex("postId_authorId").on(
			table.postId,
			table.authorId,
		),
	}),
);

// Post collaborators (many-to-many relationship)
export const postCollaborators = pgTable(
	"PostCollaborators",
	{
		postId: varchar("postId", { length: 21 }).notNull(),
		userId: uuid("userId").notNull(),
	},
	(table) => ({
		postIdUserIdIdx: uniqueIndex("PostCollaborators_postId_userId_idx").on(
			table.postId,
			table.userId,
		),
		postIdIdx: index("PostCollaborators_postId_idx").on(table.postId),
		userIdIdx: index("PostCollaborators_userId_idx").on(table.userId),
	}),
);

// Relations
export const postsRelations = relations(posts, ({ one, many }) => ({
	author: one("users", {
		fields: [posts.authorId],
		references: ["id"],
	}),
	views: one(postViews, {
		fields: [posts.id],
		references: [postViews.postId],
	}),
	comments: many("comments"),
	votes: many("votes"),
	bookmarks: many("bookmarks"),
	reports: many("reports"),
	completionStatuses: many("completionStatuses"),
	challengeTemplates: many("challengeTemplates"),
	challengeSubmissions: many("challengeSubmissions"),
	edits: many(postEdits),
	collaborators: many(postCollaborators),
}));

export const postViewsRelations = relations(postViews, ({ one }) => ({
	post: one(posts, {
		fields: [postViews.postId],
		references: [posts.id],
	}),
}));

export const postEditsRelations = relations(postEdits, ({ one }) => ({
	post: one(posts, {
		fields: [postEdits.postId],
		references: [posts.id],
	}),
	author: one("users", {
		fields: [postEdits.authorId],
		references: ["id"],
	}),
}));

export const postCollaboratorsRelations = relations(
	postCollaborators,
	({ one }) => ({
		post: one(posts, {
			fields: [postCollaborators.postId],
			references: [posts.id],
		}),
		user: one("users", {
			fields: [postCollaborators.userId],
			references: ["id"],
		}),
	}),
);
