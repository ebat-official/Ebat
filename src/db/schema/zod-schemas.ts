import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { z } from "zod";
import { account, session, user, verification } from "./auth";
import {
	bookmarks,
	challengeSubmissions,
	challengeTemplates,
	commentMentions,
	commentVotes,
	comments,
	completionStatuses,
	follows,
	notifications,
	postCollaborators,
	postEdits,
	postViews,
	posts,
	reports,
	users,
	votes,
} from "./index";

// Type exports using native Drizzle inference
export type User = InferSelectModel<typeof user>;
export type AuthSession = InferSelectModel<typeof session>;
export type AuthAccount = InferSelectModel<typeof account>;
export type AuthVerification = InferSelectModel<typeof verification>;
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

// Insert types using native Drizzle inference
export type InsertUser = InferInsertModel<typeof user>;
export type InsertAuthSession = InferInsertModel<typeof session>;
export type InsertAuthAccount = InferInsertModel<typeof account>;
export type InsertAuthVerification = InferInsertModel<typeof verification>;
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
