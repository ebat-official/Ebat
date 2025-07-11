import { pgEnum } from "drizzle-orm/pg-core";

export enum UserRole {
	ADMIN = "ADMIN",
	USER = "USER",
}

export enum SubscriptionPlan {
	BASIC = "BASIC",
	PREMIUM = "PREMIUM",
}

export enum AccountStatus {
	ACTIVE = "ACTIVE",
	INACTIVE = "INACTIVE",
	SUSPENDED = "SUSPENDED",
}

export enum VoteType {
	UP = "UP",
	DOWN = "DOWN",
}

export enum PostType {
	BLOGS = "BLOGS",
	QUESTION = "QUESTION",
	CHALLENGE = "CHALLENGE",
	SYSTEMDESIGN = "SYSTEMDESIGN",
}

export enum Difficulty {
	EASY = "EASY",
	MEDIUM = "MEDIUM",
	HARD = "HARD",
}

export enum PostCategory {
	FRONTEND = "FRONTEND",
	BACKEND = "BACKEND",
	ANDROID = "ANDROID",
}

export enum PostStatus {
	DRAFT = "DRAFT",
	PUBLISHED = "PUBLISHED",
}

export enum PostApprovalStatus {
	PENDING = "PENDING",
	APPROVED = "APPROVED",
	REJECTED = "REJECTED",
}

export enum SubCategory {
	JAVASCRIPT = "JAVASCRIPT",
	HTML = "HTML",
	CSS = "CSS",
	REACT = "REACT",
	BLOGS = "BLOGS",
	SYSTEMDESIGN = "SYSTEMDESIGN",
	VUE = "VUE",
	ANGULAR = "ANGULAR",
	SVELTEKIT = "SVELTEKIT",
	VANILLAJS = "VANILLAJS",
	NEXTJS = "NEXTJS",
}

export enum TemplateFramework {
	REACT = "REACT",
	NEXTJS = "NEXTJS",
	ANGULAR = "ANGULAR",
	VUE = "VUE",
	SVELTEKIT = "SVELTEKIT",
	VANILLAJS = "VANILLAJS",
	JAVASCRIPT = "JAVASCRIPT",
}

export enum SubmissionStatus {
	ACCEPTED = "ACCEPTED",
	REJECTED = "REJECTED",
}

// pgEnum definitions for database schema
export const userRoleEnum = pgEnum("user_role", UserRole);
export const subscriptionPlanEnum = pgEnum(
	"subscription_plan",
	SubscriptionPlan,
);
export const accountStatusEnum = pgEnum("account_status", AccountStatus);
export const voteTypeEnum = pgEnum("vote_type", VoteType);
export const postTypeEnum = pgEnum("post_type", PostType);
export const difficultyEnum = pgEnum("difficulty", Difficulty);
export const postCategoryEnum = pgEnum("post_category", PostCategory);
export const postStatusEnum = pgEnum("post_status", PostStatus);
export const postApprovalStatusEnum = pgEnum(
	"post_approval_status",
	PostApprovalStatus,
);
export const subCategoryEnum = pgEnum("sub_category", SubCategory);
export const templateFrameworkEnum = pgEnum(
	"template_framework",
	TemplateFramework,
);
export const submissionStatusEnum = pgEnum(
	"submission_status",
	SubmissionStatus,
);

// Type exports (these will now be the enum types directly)
export type UserRoleType = UserRole;
export type SubscriptionPlanType = SubscriptionPlan;
export type AccountStatusType = AccountStatus;
export type VoteTypeType = VoteType;
export type PostTypeType = PostType;
export type DifficultyType = Difficulty;
export type PostCategoryType = PostCategory;
export type PostStatusType = PostStatus;
export type PostApprovalStatusType = PostApprovalStatus;
export type SubCategoryType = SubCategory;
export type TemplateFrameworkType = TemplateFramework;
export type SubmissionStatusType = SubmissionStatus;
