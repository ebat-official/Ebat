import {
	boolean,
	index,
	integer,
	json,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import {
	AccountStatus,
	SubscriptionPlan,
	UserRole,
	accountStatusEnum,
	subscriptionPlanEnum,
	userRoleEnum,
} from "./enums";

export const user = pgTable("user", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified")
		.$defaultFn(() => false)
		.notNull(),
	image: text("image"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.$defaultFn(() => new Date())
		.notNull(),
	username: text("username").unique().notNull(),
	displayUsername: text("display_username"),
	role: userRoleEnum("role").notNull().default(UserRole.USER),
	banned: boolean("banned"),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires", { withTimezone: true }),
	accountStatus: accountStatusEnum("account_status")
		.notNull()
		.default(AccountStatus.ACTIVE),
	karmaPoints: integer("karma_points").notNull().default(0),
	coins: integer("coins").notNull().default(0),
	jobTitle: text("job_title"),
	description: text("description"),
	companyName: text("company_name"),
	coverImage: text("cover_image"),
	location: text("location"),
	subscriptionPlan: subscriptionPlanEnum("subscription_plan")
		.notNull()
		.default(SubscriptionPlan.BASIC),
	externalLinks: json("external_links"),
	experience: integer("experience"),
});

export const session = pgTable("session", {
	id: uuid("id").primaryKey().defaultRandom(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: uuid("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	impersonatedBy: text("impersonated_by"),
});

export const account = pgTable(
	"account",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at", {
			withTimezone: true,
		}),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
			withTimezone: true,
		}),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		uniqueIndex("account_provider_accountId_idx").on(
			table.providerId,
			table.accountId,
		),
	],
);

export const verification = pgTable("verification", {
	id: uuid("id").primaryKey().defaultRandom(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).$defaultFn(
		() => new Date(),
	),
	updatedAt: timestamp("updated_at", { withTimezone: true }).$defaultFn(
		() => new Date(),
	),
});

// Export schema object for BetterAuth drizzle adapter
export const authSchema = {
	user,
	session,
	account,
	verification,
};

// Default export for convenience
export default authSchema;
