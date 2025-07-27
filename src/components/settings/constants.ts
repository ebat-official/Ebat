import { AccountStatus, SubscriptionPlan, UserRole } from "@/db/schema/enums";
import type { CategoryColumns, ColumnConfig } from "./types";

// Column configuration for admin user table
export const columnConfig: Record<string, ColumnConfig> = {
	user: {
		id: "user",
		label: "User",
		description: "User avatar, name, and email",
		category: "basic",
	},
	role: {
		id: "role",
		label: "Role",
		description: "User role (admin/user)",
		category: "basic",
	},
	createdAt: {
		id: "createdAt",
		label: "Created",
		description: "Account creation date",
		category: "basic",
	},
	status: {
		id: "status",
		label: "Status",
		description: "Account status (active/banned)",
		category: "basic",
	},
	username: {
		id: "username",
		label: "Username",
		description: "User's unique username",
		category: "profile",
	},
	emailVerified: {
		id: "emailVerified",
		label: "Email Verified",
		description: "Email verification status",
		category: "profile",
	},
	updatedAt: {
		id: "updatedAt",
		label: "Last Updated",
		description: "Last profile update",
		category: "profile",
	},
	accountStatus: {
		id: "accountStatus",
		label: "Account Status",
		description: "Detailed account status",
		category: "profile",
	},
	karmaPoints: {
		id: "karmaPoints",
		label: "Karma Points",
		description: "User's karma points",
		category: "engagement",
	},
	coins: {
		id: "coins",
		label: "Coins",
		description: "User's coin balance",
		category: "engagement",
	},
	subscriptionPlan: {
		id: "subscriptionPlan",
		label: "Subscription",
		description: "User's subscription plan",
		category: "engagement",
	},
	jobTitle: {
		id: "jobTitle",
		label: "Job Title",
		description: "User's job title",
		category: "professional",
	},
	companyName: {
		id: "companyName",
		label: "Company",
		description: "User's company name",
		category: "professional",
	},
	location: {
		id: "location",
		label: "Location",
		description: "User's location",
		category: "professional",
	},
	description: {
		id: "description",
		label: "Description",
		description: "User's bio/description",
		category: "professional",
	},
};

export const categoryColumns: CategoryColumns = {
	basic: ["user", "role", "createdAt", "status"],
	profile: ["username", "emailVerified", "updatedAt", "accountStatus"],
	engagement: ["karmaPoints", "coins", "subscriptionPlan"],
	professional: ["jobTitle", "companyName", "location", "description"],
};

export const defaultColumns = ["user", "role", "createdAt", "status"];

// User role options for forms
export const userRoleOptions = [
	{ value: UserRole.USER, label: "User" },
	{ value: UserRole.EDITOR, label: "Editor" },
	{ value: UserRole.MODERATOR, label: "Moderator" },
	{ value: UserRole.ADMIN, label: "Admin" },
];

// Account status options
export const accountStatusOptions = [
	{ value: AccountStatus.ACTIVE, label: "Active" },
	{ value: AccountStatus.INACTIVE, label: "Inactive" },
	{ value: AccountStatus.SUSPENDED, label: "Suspended" },
];

// Subscription plan options
export const subscriptionPlanOptions = [
	{ value: SubscriptionPlan.BASIC, label: "Basic" },
	{ value: SubscriptionPlan.PREMIUM, label: "Premium" },
];

// Table pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Search and filter constants
export const SEARCH_FIELDS = ["name", "email", "username"] as const;

// Sort field constants using enum-like structure
export const SORT_FIELDS = {
	CREATED_AT: "createdAt",
	UPDATED_AT: "updatedAt",
	NAME: "name",
	EMAIL: "email",
	USER_NAME: "username",
	ROLE: "role",
	ACCOUNT_STATUS: "accountStatus",
	KARMA_POINTS: "karmaPoints",
	COINS: "coins",
} as const;

// Sort field values array for backward compatibility
export const SORT_FIELD_VALUES = [
	SORT_FIELDS.CREATED_AT,
	SORT_FIELDS.UPDATED_AT,
	SORT_FIELDS.NAME,
	SORT_FIELDS.EMAIL,
	SORT_FIELDS.USER_NAME,
	SORT_FIELDS.ROLE,
	SORT_FIELDS.ACCOUNT_STATUS,
	SORT_FIELDS.KARMA_POINTS,
	SORT_FIELDS.COINS,
] as const;

// Search field constants using enum-like structure
export const SEARCH_FIELD_KEYS = {
	NAME: "name",
	EMAIL: "email",
	USER_NAME: "username",
} as const;

// Search field values array for backward compatibility
export const SEARCH_FIELD_VALUES = [
	SEARCH_FIELD_KEYS.NAME,
	SEARCH_FIELD_KEYS.EMAIL,
	SEARCH_FIELD_KEYS.USER_NAME,
] as const;
