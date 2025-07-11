import {
	pgTable,
	uuid,
	varchar,
	text,
	timestamp,
	integer,
	json,
	boolean,
	uniqueIndex,
	index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
	userRoleEnum,
	accountStatusEnum,
	subscriptionPlanEnum,
	UserRole,
	AccountStatus,
	SubscriptionPlan,
} from "./enums";

// Users table
export const users = pgTable(
	"User",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		email: varchar("email", { length: 255 }).notNull().unique(),
		userName: varchar("userName", { length: 255 }).unique(),
		password: varchar("password", { length: 255 }),
		emailVerified: timestamp("emailVerified"),
		role: userRoleEnum("role").notNull().default(UserRole.USER),
		accountStatus: accountStatusEnum("accountStatus")
			.notNull()
			.default(AccountStatus.ACTIVE),
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
		karmaPoints: integer("karmaPoints").notNull().default(0),
		coins: integer("coins").notNull().default(0),
		lastLoginAt: timestamp("lastLoginAt"),
	},
	(table) => [
		index("User_email_idx").on(table.email),
		index("User_userName_idx").on(table.userName),
	],
);

// User profiles table
export const userProfiles = pgTable(
	"UserProfile",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("userId").notNull().unique(),
		name: varchar("name", { length: 255 }),
		email: varchar("email", { length: 255 }).notNull().unique(),
		jobTitle: varchar("jobTitle", { length: 255 }),
		description: text("description"),
		companyName: varchar("companyName", { length: 255 }),
		image: varchar("image", { length: 500 }),
		coverImage: varchar("coverImage", { length: 500 }),
		location: varchar("location", { length: 255 }),
		subscriptionPlan: subscriptionPlanEnum("subscriptionPlan")
			.notNull()
			.default(SubscriptionPlan.BASIC),
		externalLinks: json("externalLinks"),
	},
	(table) => [
		index("UserProfile_userId_idx").on(table.userId),
		index("UserProfile_email_idx").on(table.email),
	],
);

// Follows table for user relationships
export const follows = pgTable(
	"Follow",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		followerId: uuid("followerId").notNull(),
		followedId: uuid("followedId").notNull(),
		createdAt: timestamp("createdAt").notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex("Follow_followerId_followedId_idx").on(
			table.followerId,
			table.followedId,
		),
		index("Follow_followerId_idx").on(table.followerId),
		index("Follow_followedId_idx").on(table.followedId),
	],
);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
	profile: one(userProfiles, {
		fields: [users.id],
		references: [userProfiles.userId],
	}),
	accounts: many(accounts),
	posts: many(posts),
	comments: many(comments),
	votes: many(votes),
	commentVotes: many(commentVotes),
	commentMentions: many(commentMentions),
	completionStatuses: many(completionStatuses),
	bookmarks: many(bookmarks),
	reports: many(reports),
	notifications: many(notifications),
	challengeSubmissions: many(challengeSubmissions),
	// Follow relationships
	following: many(follows, { relationName: "Followers" }),
	followers: many(follows, { relationName: "Following" }),
	// Post collaborators (many-to-many)
	postCollaborators: many(postCollaborators),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
	user: one(users, {
		fields: [userProfiles.userId],
		references: [users.id],
	}),
}));

export const followsRelations = relations(follows, ({ one }) => ({
	follower: one(users, {
		fields: [follows.followerId],
		references: [users.id],
		relationName: "Followers",
	}),
	followed: one(users, {
		fields: [follows.followedId],
		references: [users.id],
		relationName: "Following",
	}),
}));

// Import other tables for relations (will be defined in other files)
import { posts } from "./posts";
import { comments, commentVotes, commentMentions } from "./comments";
import { votes } from "./votes";
import { bookmarks } from "./bookmarks";
import { reports } from "./reports";
import { notifications } from "./notifications";
import { completionStatuses } from "./completionStatuses";
import { challengeSubmissions } from "./challenges";
import { postCollaborators } from "./posts";
import { accounts } from "./auth";
