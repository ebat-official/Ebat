import { z } from "zod";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import {
	users,
	userProfiles,
	follows,
	posts,
	postViews,
	postEdits,
	postCollaborators,
	comments,
	commentVotes,
	commentMentions,
	votes,
	bookmarks,
	notifications,
	reports,
	completionStatuses,
	challengeTemplates,
	challengeSubmissions,
	accounts,
	verificationTokens,
	resetTokens,
} from "./index";

// Type exports using native Drizzle inference
export type User = InferSelectModel<typeof users>;
export type UserProfile = InferSelectModel<typeof userProfiles>;
export type Follow = InferSelectModel<typeof follows>;
export type Post = InferSelectModel<typeof posts>;
export type PostViews = InferSelectModel<typeof postViews>;
export type PostEdit = InferSelectModel<typeof postEdits>;
export type PostCollaborators = InferSelectModel<typeof postCollaborators>;
export type Comment = InferSelectModel<typeof comments>;
export type CommentVote = InferSelectModel<typeof commentVotes>;
export type CommentMention = InferSelectModel<typeof commentMentions>;
export type Vote = InferSelectModel<typeof votes>;
export type Bookmark = InferSelectModel<typeof bookmarks>;
export type Notification = InferSelectModel<typeof notifications>;
export type Report = InferSelectModel<typeof reports>;
export type CompletionStatus = InferSelectModel<typeof completionStatuses>;
export type ChallengeTemplate = InferSelectModel<typeof challengeTemplates>;
export type ChallengeSubmission = InferSelectModel<typeof challengeSubmissions>;
export type Account = InferSelectModel<typeof accounts>;
export type VerificationToken = InferSelectModel<typeof verificationTokens>;
export type ResetToken = InferSelectModel<typeof resetTokens>;

// Insert types using native Drizzle inference
export type InsertUser = InferInsertModel<typeof users>;
export type InsertUserProfile = InferInsertModel<typeof userProfiles>;
export type InsertFollow = InferInsertModel<typeof follows>;
export type InsertPost = InferInsertModel<typeof posts>;
export type InsertPostViews = InferInsertModel<typeof postViews>;
export type InsertPostEdit = InferInsertModel<typeof postEdits>;
export type InsertPostCollaborators = InferInsertModel<
	typeof postCollaborators
>;
export type InsertComment = InferInsertModel<typeof comments>;
export type InsertCommentVote = InferInsertModel<typeof commentVotes>;
export type InsertCommentMention = InferInsertModel<typeof commentMentions>;
export type InsertVote = InferInsertModel<typeof votes>;
export type InsertBookmark = InferInsertModel<typeof bookmarks>;
export type InsertNotification = InferInsertModel<typeof notifications>;
export type InsertReport = InferInsertModel<typeof reports>;
export type InsertCompletionStatus = InferInsertModel<
	typeof completionStatuses
>;
export type InsertChallengeTemplate = InferInsertModel<
	typeof challengeTemplates
>;
export type InsertChallengeSubmission = InferInsertModel<
	typeof challengeSubmissions
>;
export type InsertAccount = InferInsertModel<typeof accounts>;
export type InsertVerificationToken = InferInsertModel<
	typeof verificationTokens
>;
export type InsertResetToken = InferInsertModel<typeof resetTokens>;
