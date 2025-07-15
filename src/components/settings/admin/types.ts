// Shared types for admin components
import { AccountStatus, SubscriptionPlan, UserRole } from "@/db/schema/enums";
import type { AuthSession, User as DbUser } from "@/db/schema/zod-schemas";

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
