// Export all enums
export * from "./enums";

// Export all tables
export * from "./users";
export * from "./posts";
export * from "./comments";
export * from "./votes";
export * from "./bookmarks";
export * from "./notifications";
export * from "./reports";
export * from "./completionStatuses";
export * from "./challenges";
export * from "./auth";

// Import all tables for type safety
import { users, userProfiles, follows } from "./users";
import { posts, postViews, postEdits, postCollaborators } from "./posts";
import { comments, commentVotes, commentMentions } from "./comments";
import { votes } from "./votes";
import { bookmarks } from "./bookmarks";
import { notifications } from "./notifications";
import { reports } from "./reports";
import { completionStatuses } from "./completionStatuses";
import { challengeTemplates, challengeSubmissions } from "./challenges";
import { accounts, verificationTokens, resetTokens } from "./auth";

// Export all tables as a single object for drizzle
export const schema = {
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
};

// Export zod schemas
export * from "./zod-schemas";
