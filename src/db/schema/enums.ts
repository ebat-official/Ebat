import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("UserRole", ["ADMIN", "USER"]);
export const subscriptionPlanEnum = pgEnum("SubscriptionPlan", [
	"BASIC",
	"PREMIUM",
]);
export const accountStatusEnum = pgEnum("AccountStatus", [
	"ACTIVE",
	"INACTIVE",
	"SUSPENDED",
]);
export const voteTypeEnum = pgEnum("VoteType", ["UP", "DOWN"]);
export const postTypeEnum = pgEnum("PostType", [
	"BLOGS",
	"QUESTION",
	"CHALLENGE",
	"SYSTEMDESIGN",
]);
export const difficultyEnum = pgEnum("Difficulty", ["EASY", "MEDIUM", "HARD"]);
export const postCategoryEnum = pgEnum("PostCategory", [
	"FRONTEND",
	"BACKEND",
	"ANDROID",
]);
export const postStatusEnum = pgEnum("PostStatus", ["DRAFT", "PUBLISHED"]);
export const postApprovalStatusEnum = pgEnum("PostApprovalStatus", [
	"PENDING",
	"APPROVED",
	"REJECTED",
]);
export const subCategoryEnum = pgEnum("SubCategory", [
	"JAVASCRIPT",
	"HTML",
	"CSS",
	"REACT",
	"BLOGS",
	"SYSTEMDESIGN",
	"VUE",
	"ANGULAR",
	"SVELTEKIT",
	"VANILLAJS",
	"NEXTJS",
]);
export const templateFrameworkEnum = pgEnum("TemplateFramework", [
	"REACT",
	"NEXTJS",
	"ANGULAR",
	"VUE",
	"SVELTEKIT",
	"VANILLAJS",
	"JAVASCRIPT",
]);
export const submissionStatusEnum = pgEnum("SubmissionStatus", [
	"ACCEPTED",
	"REJECTED",
]);
