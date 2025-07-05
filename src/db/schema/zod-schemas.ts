import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
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

// User schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// UserProfile schemas
export const insertUserProfileSchema = createInsertSchema(userProfiles);
export const selectUserProfileSchema = createSelectSchema(userProfiles);

// Follow schemas
export const insertFollowSchema = createInsertSchema(follows);
export const selectFollowSchema = createSelectSchema(follows);

// Post schemas
export const insertPostSchema = createInsertSchema(posts);
export const selectPostSchema = createSelectSchema(posts);

// PostViews schemas
export const insertPostViewsSchema = createInsertSchema(postViews);
export const selectPostViewsSchema = createSelectSchema(postViews);

// PostEdit schemas
export const insertPostEditSchema = createInsertSchema(postEdits);
export const selectPostEditSchema = createSelectSchema(postEdits);

// PostCollaborators schemas
export const insertPostCollaboratorsSchema =
	createInsertSchema(postCollaborators);
export const selectPostCollaboratorsSchema =
	createSelectSchema(postCollaborators);

// Comment schemas
export const insertCommentSchema = createInsertSchema(comments);
export const selectCommentSchema = createSelectSchema(comments);

// CommentVote schemas
export const insertCommentVoteSchema = createInsertSchema(commentVotes);
export const selectCommentVoteSchema = createSelectSchema(commentVotes);

// CommentMention schemas
export const insertCommentMentionSchema = createInsertSchema(commentMentions);
export const selectCommentMentionSchema = createSelectSchema(commentMentions);

// Vote schemas
export const insertVoteSchema = createInsertSchema(votes);
export const selectVoteSchema = createSelectSchema(votes);

// Bookmark schemas
export const insertBookmarkSchema = createInsertSchema(bookmarks);
export const selectBookmarkSchema = createSelectSchema(bookmarks);

// Notification schemas
export const insertNotificationSchema = createInsertSchema(notifications);
export const selectNotificationSchema = createSelectSchema(notifications);

// Report schemas
export const insertReportSchema = createInsertSchema(reports);
export const selectReportSchema = createSelectSchema(reports);

// CompletionStatus schemas
export const insertCompletionStatusSchema =
	createInsertSchema(completionStatuses);
export const selectCompletionStatusSchema =
	createSelectSchema(completionStatuses);

// ChallengeTemplate schemas
export const insertChallengeTemplateSchema =
	createInsertSchema(challengeTemplates);
export const selectChallengeTemplateSchema =
	createSelectSchema(challengeTemplates);

// ChallengeSubmission schemas
export const insertChallengeSubmissionSchema =
	createInsertSchema(challengeSubmissions);
export const selectChallengeSubmissionSchema =
	createSelectSchema(challengeSubmissions);

// Account schemas
export const insertAccountSchema = createInsertSchema(accounts);
export const selectAccountSchema = createSelectSchema(accounts);

// VerificationToken schemas
export const insertVerificationTokenSchema =
	createInsertSchema(verificationTokens);
export const selectVerificationTokenSchema =
	createSelectSchema(verificationTokens);

// ResetToken schemas
export const insertResetTokenSchema = createInsertSchema(resetTokens);
export const selectResetTokenSchema = createSelectSchema(resetTokens);

// Type exports for use throughout the app
export type User = z.infer<typeof selectUserSchema>;
export type UserProfile = z.infer<typeof selectUserProfileSchema>;
export type Follow = z.infer<typeof selectFollowSchema>;
export type Post = z.infer<typeof selectPostSchema>;
export type PostViews = z.infer<typeof selectPostViewsSchema>;
export type PostEdit = z.infer<typeof selectPostEditSchema>;
export type PostCollaborators = z.infer<typeof selectPostCollaboratorsSchema>;
export type Comment = z.infer<typeof selectCommentSchema>;
export type CommentVote = z.infer<typeof selectCommentVoteSchema>;
export type CommentMention = z.infer<typeof selectCommentMentionSchema>;
export type Vote = z.infer<typeof selectVoteSchema>;
export type Bookmark = z.infer<typeof selectBookmarkSchema>;
export type Notification = z.infer<typeof selectNotificationSchema>;
export type Report = z.infer<typeof selectReportSchema>;
export type CompletionStatus = z.infer<typeof selectCompletionStatusSchema>;
export type ChallengeTemplate = z.infer<typeof selectChallengeTemplateSchema>;
export type ChallengeSubmission = z.infer<
	typeof selectChallengeSubmissionSchema
>;
export type Account = z.infer<typeof selectAccountSchema>;
export type VerificationToken = z.infer<typeof selectVerificationTokenSchema>;
export type ResetToken = z.infer<typeof selectResetTokenSchema>;

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertPostViews = z.infer<typeof insertPostViewsSchema>;
export type InsertPostEdit = z.infer<typeof insertPostEditSchema>;
export type InsertPostCollaborators = z.infer<
	typeof insertPostCollaboratorsSchema
>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertCommentVote = z.infer<typeof insertCommentVoteSchema>;
export type InsertCommentMention = z.infer<typeof insertCommentMentionSchema>;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type InsertCompletionStatus = z.infer<
	typeof insertCompletionStatusSchema
>;
export type InsertChallengeTemplate = z.infer<
	typeof insertChallengeTemplateSchema
>;
export type InsertChallengeSubmission = z.infer<
	typeof insertChallengeSubmissionSchema
>;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type InsertVerificationToken = z.infer<
	typeof insertVerificationTokenSchema
>;
export type InsertResetToken = z.infer<typeof insertResetTokenSchema>;
