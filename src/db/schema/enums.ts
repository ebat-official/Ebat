import { pgEnum } from "drizzle-orm/pg-core";

export enum UserRole {
	SUPER_ADMIN = "superadmin",
	ADMIN = "admin",
	USER = "user",
	EDITOR = "editor",
	MODERATOR = "moderator",
}

export enum SubscriptionPlan {
	BASIC = "basic",
	PREMIUM = "premium",
}

export enum AccountStatus {
	ACTIVE = "active",
	INACTIVE = "inactive",
	SUSPENDED = "suspended",
}

export enum VoteType {
	UP = "up",
	DOWN = "down",
}

export enum PostType {
	BLOGS = "blogs",
	QUESTION = "question",
	CHALLENGE = "challenge",
	HLD = "hld",
	LLD = "lld",
}

export enum Difficulty {
	EASY = "easy",
	MEDIUM = "medium",
	HARD = "hard",
}

export enum PostCategory {
	FRONTEND = "frontend",
	BACKEND = "backend",
	ANDROID = "android",
}

export enum PostStatus {
	DRAFT = "draft",
	PUBLISHED = "published",
}

export enum PostApprovalStatus {
	PENDING = "pending",
	APPROVED = "approved",
	REJECTED = "rejected",
}

export enum SubCategory {
	JAVASCRIPT = "javascript",
	HTML = "html",
	CSS = "css",
	REACT = "react",
	BLOGS = "blogs",
	SYSTEMDESIGN = "systemdesign",
	VUE = "vue",
	ANGULAR = "angular",
	SVELTEKIT = "sveltekit",
	VANILLAJS = "vanillajs",
	NEXTJS = "nextjs",
	BEHAVIORAL = "behavioral",
}

export enum TemplateFramework {
	REACT = "react",
	NEXTJS = "nextjs",
	ANGULAR = "angular",
	VUE = "vue",
	SVELTEKIT = "sveltekit",
	VANILLAJS = "vanillajs",
	JAVASCRIPT = "javascript",
}

export enum SubmissionStatus {
	ACCEPTED = "accepted",
	REJECTED = "rejected",
}
export enum FollowAction {
	FOLLOW = "follow",
	UNFOLLOW = "unfollow",
}

export enum KarmaAction {
	POST_APPROVAL = "post_approval",
	POST_EDIT_APPROVAL = "post_edit_approval",
	POST_VOTE = "post_vote",
	POST_VOTE_REMOVAL = "post_vote_removal",
	COMMENT_VOTE = "comment_vote",
	COMMENT_VOTE_REMOVAL = "comment_vote_removal",
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
export const followActionEnum = pgEnum("follow_action", FollowAction);
export const karmaActionEnum = pgEnum("karma_action", KarmaAction);

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
export type FollowActionType = FollowAction;
export type KarmaActionType = KarmaAction;
