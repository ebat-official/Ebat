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
import { templateFrameworkEnum, submissionStatusEnum } from "./enums";

// ChallengeTemplate table
export const challengeTemplates = pgTable(
	"ChallengeTemplate",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		postId: varchar("postId", { length: 21 }).notNull(),
		framework: templateFrameworkEnum("framework").notNull(),
		questionTemplate: json("questionTemplate").notNull(),
		answerTemplate: json("answerTemplate").notNull(),
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(table) => ({
		postIdFrameworkIdx: uniqueIndex(
			"ChallengeTemplate_postId_framework_idx",
		).on(table.postId, table.framework),
		postIdIdx: index("ChallengeTemplate_postId_idx").on(table.postId),
	}),
);

// ChallengeSubmission table
export const challengeSubmissions = pgTable(
	"ChallengeSubmission",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("userId").notNull(),
		postId: varchar("postId", { length: 21 }).notNull(),
		framework: templateFrameworkEnum("framework").notNull(),
		answerTemplate: json("answerTemplate").notNull(),
		runTime: integer("runTime").notNull().default(0),
		status: submissionStatusEnum("status").notNull().default("REJECTED"),
		submittedAt: timestamp("submittedAt").notNull().defaultNow(),
	},
	(table) => ({
		postIdUserIdIdx: index("ChallengeSubmission_postId_userId_idx").on(
			table.postId,
			table.userId,
		),
		userIdIdx: index("ChallengeSubmission_userId_idx").on(table.userId),
		postIdIdx: index("ChallengeSubmission_postId_idx").on(table.postId),
	}),
);
