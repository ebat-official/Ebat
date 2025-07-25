import {
	index,
	integer,
	json,
	pgTable,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import {
	SubmissionStatus,
	submissionStatusEnum,
	templateFrameworkEnum,
} from "./enums";
import { posts, postEdits } from "./posts";

// ChallengeTemplate table
export const challengeTemplates = pgTable(
	"challengeTemplate",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		postId: varchar("post_id", { length: 21 })
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		framework: templateFrameworkEnum("framework").notNull(),
		questionTemplate: json("question_template").notNull(),
		answerTemplate: json("answer_template").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		postEditId: uuid("post_edit_id").references(() => postEdits.id, {
			onDelete: "cascade",
		}),
	},
	(table) => [
		uniqueIndex("challengeTemplate_postId_framework_idx").on(
			table.postId,
			table.framework,
			table.postEditId,
		),
		index("challengeTemplate_postId_idx").on(table.postId),
		index("challengeTemplate_postEditId_idx").on(table.postEditId),
	],
);

// ChallengeSubmission table
export const challengeSubmissions = pgTable(
	"challengeSubmission",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		postId: varchar("post_id", { length: 21 })
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		framework: templateFrameworkEnum("framework").notNull(),
		answerTemplate: json("answer_template").notNull(),
		runTime: integer("run_time").notNull().default(0),
		status: submissionStatusEnum("status")
			.notNull()
			.default(SubmissionStatus.REJECTED),
		submittedAt: timestamp("submitted_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
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
