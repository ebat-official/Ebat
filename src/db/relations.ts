import { relations } from "drizzle-orm";

// Import all tables
import { user } from "./schema/auth";
import { follows } from "./schema/follows";
import { posts, postViews, postEdits, postCollaborators } from "./schema/posts";
import { comments, commentVotes, commentMentions } from "./schema/comments";
import { votes } from "./schema/votes";
import { bookmarks } from "./schema/bookmarks";
import { notifications } from "./schema/notifications";
import { reports } from "./schema/reports";
import { completionStatuses } from "./schema/completionStatuses";
import { challengeTemplates, challengeSubmissions } from "./schema/challenges";

// ==================== USER RELATIONS ====================
export const userRelations = relations(user, ({ many }) => ({
	// Content relations
	posts: many(posts),
	comments: many(comments),
	votes: many(votes),
	commentVotes: many(commentVotes),
	commentMentions: many(commentMentions),

	// Progress & engagement
	completionStatuses: many(completionStatuses),
	bookmarks: many(bookmarks),
	challengeSubmissions: many(challengeSubmissions),

	// Social relations
	following: many(follows, { relationName: "Followers" }),
	followers: many(follows, { relationName: "Following" }),

	// Collaboration
	collaborators: many(postCollaborators),

	// Moderation
	reports: many(reports),
	notifications: many(notifications),
}));

// ==================== FOLLOW RELATIONS ====================
export const followsRelations = relations(follows, ({ one }) => ({
	follower: one(user, {
		fields: [follows.followerId],
		references: [user.id],
		relationName: "Followers",
	}),
	followed: one(user, {
		fields: [follows.followedId],
		references: [user.id],
		relationName: "Following",
	}),
}));

// ==================== POST RELATIONS ====================
export const postsRelations = relations(posts, ({ one, many }) => ({
	author: one(user, {
		fields: [posts.authorId],
		references: [user.id],
	}),
	views: one(postViews, {
		fields: [posts.id],
		references: [postViews.postId],
	}),
	comments: many(comments),
	votes: many(votes),
	bookmarks: many(bookmarks),
	completionStatuses: many(completionStatuses),
	challengeTemplates: many(challengeTemplates),
	challengeSubmissions: many(challengeSubmissions),
	postEdits: many(postEdits),
	collaborators: many(postCollaborators),
	reports: many(reports),
}));

export const postViewsRelations = relations(postViews, ({ one }) => ({
	post: one(posts, {
		fields: [postViews.postId],
		references: [posts.id],
	}),
}));

export const postEditsRelations = relations(postEdits, ({ one }) => ({
	post: one(posts, {
		fields: [postEdits.postId],
		references: [posts.id],
	}),
	author: one(user, {
		fields: [postEdits.authorId],
		references: [user.id],
	}),
}));

export const postCollaboratorsRelations = relations(
	postCollaborators,
	({ one }) => ({
		post: one(posts, {
			fields: [postCollaborators.postId],
			references: [posts.id],
		}),
		user: one(user, {
			fields: [postCollaborators.userId],
			references: [user.id],
		}),
	}),
);

// ==================== COMMENT RELATIONS ====================
export const commentsRelations = relations(comments, ({ one, many }) => ({
	author: one(user, {
		fields: [comments.authorId],
		references: [user.id],
	}),
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id],
	}),
	parent: one(comments, {
		fields: [comments.parentId],
		references: [comments.id],
		relationName: "ParentChild",
	}),
	children: many(comments, { relationName: "ParentChild" }),
	votes: many(commentVotes),
	mentions: many(commentMentions),
	reports: many(reports),
}));

export const commentVotesRelations = relations(commentVotes, ({ one }) => ({
	user: one(user, {
		fields: [commentVotes.userId],
		references: [user.id],
	}),
	comment: one(comments, {
		fields: [commentVotes.commentId],
		references: [comments.id],
	}),
}));

export const commentMentionsRelations = relations(
	commentMentions,
	({ one }) => ({
		user: one(user, {
			fields: [commentMentions.userId],
			references: [user.id],
		}),
		comment: one(comments, {
			fields: [commentMentions.commentId],
			references: [comments.id],
		}),
	}),
);

// ==================== VOTE RELATIONS ====================
export const votesRelations = relations(votes, ({ one }) => ({
	user: one(user, {
		fields: [votes.userId],
		references: [user.id],
	}),
	post: one(posts, {
		fields: [votes.postId],
		references: [posts.id],
	}),
}));

// ==================== BOOKMARK RELATIONS ====================
export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
	user: one(user, {
		fields: [bookmarks.userId],
		references: [user.id],
	}),
	post: one(posts, {
		fields: [bookmarks.postId],
		references: [posts.id],
	}),
}));

// ==================== NOTIFICATION RELATIONS ====================
export const notificationsRelations = relations(notifications, ({ one }) => ({
	user: one(user, {
		fields: [notifications.userId],
		references: [user.id],
	}),
}));

// ==================== REPORT RELATIONS ====================
export const reportsRelations = relations(reports, ({ one }) => ({
	reporter: one(user, {
		fields: [reports.reporterId],
		references: [user.id],
	}),
	post: one(posts, {
		fields: [reports.postId],
		references: [posts.id],
	}),
	comment: one(comments, {
		fields: [reports.commentId],
		references: [comments.id],
	}),
}));

// ==================== COMPLETION STATUS RELATIONS ====================
export const completionStatusesRelations = relations(
	completionStatuses,
	({ one }) => ({
		user: one(user, {
			fields: [completionStatuses.userId],
			references: [user.id],
		}),
		post: one(posts, {
			fields: [completionStatuses.postId],
			references: [posts.id],
		}),
	}),
);

// ==================== CHALLENGE RELATIONS ====================
export const challengeTemplatesRelations = relations(
	challengeTemplates,
	({ one, many }) => ({
		post: one(posts, {
			fields: [challengeTemplates.postId],
			references: [posts.id],
		}),
		submissions: many(challengeSubmissions),
	}),
);

export const challengeSubmissionsRelations = relations(
	challengeSubmissions,
	({ one }) => ({
		post: one(posts, {
			fields: [challengeSubmissions.postId],
			references: [posts.id],
		}),
		user: one(user, {
			fields: [challengeSubmissions.userId],
			references: [user.id],
		}),
	}),
);
