// Export all enums
export * from "./enums";

// Export all tables
export * from "./follows";
export * from "./posts";
export * from "./comments";
export * from "./votes";
export * from "./bookmarks";
export * from "./notifications";
export * from "./reports";
export * from "./completionStatuses";
export * from "./challenges";
export * from "./auth";

// Export all relations
export * from "../relations";

// Import all tables for type safety
import { follows } from "./follows";
import { posts, postViews, postEdits, postCollaborators } from "./posts";
import { comments, commentVotes, commentMentions } from "./comments";
import { votes } from "./votes";
import { bookmarks } from "./bookmarks";
import { notifications } from "./notifications";
import { reports } from "./reports";
import { completionStatuses } from "./completionStatuses";
import { challengeTemplates, challengeSubmissions } from "./challenges";
import { user, session, account, verification } from "./auth";

// Rename BetterAuth user table to users for consistency
export const users = user;

// Export all tables as a single object for drizzle
export const schema = {
	users,
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
	// BetterAuth tables
	user,
	session,
	account,
	verification,
};

// Export zod schemas
export * from "./zod-schemas";
