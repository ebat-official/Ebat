import { AccountStatus, SubscriptionPlan, UserRole } from "@/db/schema/enums";
import type {
	AuthSession,
	User as DbUser,
	Post,
	PostEdit,
	Bookmark,
	User as DbUserType,
} from "@/db/schema/zod-schemas";

// Re-export database types for convenience
export type User = DbUser;
export type Session = AuthSession;

export interface BanUserData {
	reason: string;
	expiresIn?: number;
}

export interface CreateUserData {
	name: string;
	email: string;
	role: UserRole;
	password?: string;
}

export type SortOrder = "asc" | "desc";

export interface ColumnConfig {
	id: string;
	label: string;
	description: string;
	category: "basic" | "profile" | "engagement" | "professional";
}

export interface CategoryColumns {
	basic: string[];
	profile: string[];
	engagement: string[];
	professional: string[];
}

// Approval-related types
export interface PostWithAuthor extends Post {
	author: Pick<DbUserType, "id" | "name" | "username" | "email">;
}

export interface PostEditWithAuthor extends PostEdit {
	author: Pick<DbUserType, "id" | "name" | "username" | "email">;
}

// Bookmark-related types
export interface BookmarkWithPost extends Bookmark {
	post: Post & {
		author: Pick<DbUserType, "id" | "name" | "username">;
	};
}

export interface ApprovalFilters {
	category: string;
	subcategory: string;
	type: string;
	difficulty: string;
	companies: string[];
	topics: string[];
}

export interface ApprovalTableState {
	searchQuery: string;
	sortField: string;
	sortOrder: SortOrder;
	filters: Record<string, string>;
}
