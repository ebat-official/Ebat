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
export * from "./karmaLogs";

// Export all relations
export * from "../relations";

import { account, session, user, verification } from "./auth";
import { bookmarks } from "./bookmarks";
import { challengeSubmissions, challengeTemplates } from "./challenges";
import { commentMentions, commentVotes, comments } from "./comments";
import { completionStatuses } from "./completionStatuses";
// Import all tables for type safety
import { follows } from "./follows";
import { notifications } from "./notifications";
import { postContributors, postEdits, postViews, posts } from "./posts";
import { reports } from "./reports";
import { votes } from "./votes";
import { karmaLogs } from "./karmaLogs";

// Rename BetterAuth user table to users for consistency
export const users = user;

// Export all tables as a single object for drizzle
export const schema = {
	users,
	follows,
	posts,
	postViews,
	postEdits,
	postContributors,
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
	karmaLogs,
	// BetterAuth tables
	user,
	session,
	account,
	verification,
};

// Export zod schemas
export * from "./zod-schemas";
