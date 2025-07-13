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

// ChallengeTemplate table
export const challengeTemplates = pgTable(
	"challengeTemplate",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		postId: varchar("post_id", { length: 21 }).notNull(),
		framework: templateFrameworkEnum("framework").notNull(),
		questionTemplate: json("question_template").notNull(),
		answerTemplate: json("answer_template").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
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
		userId: uuid("user_id").notNull(),
		postId: varchar("post_id", { length: 21 }).notNull(),
		framework: templateFrameworkEnum("framework").notNull(),
		answerTemplate: json("answer_template").notNull(),
		runTime: integer("run_time").notNull().default(0),
		status: submissionStatusEnum("status")
			.notNull()
			.default(SubmissionStatus.REJECTED),
		submittedAt: timestamp("submitted_at").notNull().defaultNow(),
	},
	(table) => [
		index("challengeSubmission_postId_userId_idx").on(
			table.postId,
			table.userId,
		),
		index("challengeSubmission_userId_idx").on(table.userId),
		index("challengeSubmission_postId_idx").on(table.postId),
	],
);

// Relations moved to relations.ts
