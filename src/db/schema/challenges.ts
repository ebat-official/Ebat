import {
	pgTable,
	uuid,
	varchar,
	json,
	timestamp,
	integer,
	index,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import {
	templateFrameworkEnum,
	submissionStatusEnum,
	SubmissionStatus,
} from "./enums";
import { relations } from "drizzle-orm";
import { posts } from "./posts";
import { users } from "./users";

// ChallengeTemplate table
export const challengeTemplates = pgTable(
	"challengeTemplate",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		postId: varchar("postId", { length: 21 }).notNull(),
		framework: templateFrameworkEnum("framework").notNull(),
		questionTemplate: json("questionTemplate").notNull(),
		answerTemplate: json("answerTemplate").notNull(),
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex("challengeTemplate_postId_framework_idx").on(
			table.postId,
			table.framework,
		),
		index("challengeTemplate_postId_idx").on(table.postId),
	],
);

// ChallengeSubmission table
export const challengeSubmissions = pgTable(
	"challengeSubmission",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("userId").notNull(),
		postId: varchar("postId", { length: 21 }).notNull(),
		framework: templateFrameworkEnum("framework").notNull(),
		answerTemplate: json("answerTemplate").notNull(),
		runTime: integer("runTime").notNull().default(0),
		status: submissionStatusEnum("status")
			.notNull()
			.default(SubmissionStatus.REJECTED),
		submittedAt: timestamp("submittedAt").notNull().defaultNow(),
	},
	(table) => ({
		postIdUserIdIdx: index("challengeSubmission_postId_userId_idx").on(
			table.postId,
			table.userId,
		),
		userIdIdx: index("challengeSubmission_userId_idx").on(table.userId),
		postIdIdx: index("challengeSubmission_postId_idx").on(table.postId),
	}),
);

// Relations
export const challengeTemplatesRelations = relations(
	challengeTemplates,
	({ one }) => ({
		post: one(posts, {
			fields: [challengeTemplates.postId],
			references: [posts.id],
		}),
	}),
);

export const challengeSubmissionsRelations = relations(
	challengeSubmissions,
	({ one }) => ({
		post: one(posts, {
			fields: [challengeSubmissions.postId],
			references: [posts.id],
		}),
		user: one(users, {
			fields: [challengeSubmissions.userId],
			references: [users.id],
		}),
	}),
);
