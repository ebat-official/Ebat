import { UserRole } from "@/db/schema/enums";

// Role hierarchy levels - higher number means higher privileges
export const ROLE_HIERARCHY = {
	[UserRole.USER]: 0,
	[UserRole.EDITOR]: 1,
	[UserRole.MODERATOR]: 2,
	[UserRole.ADMIN]: 3,
	[UserRole.SUPER_ADMIN]: 4,
} as const;

// Minimum hierarchy level required for admin access
export const ADMIN_ACCESS_LEVEL = 3; // ADMIN and above

// Minimum hierarchy level required for moderator access
export const MODERATOR_ACCESS_LEVEL = 2; // MODERATOR and above

// Minimum hierarchy level required for editor access
export const EDITOR_ACCESS_LEVEL = 1; // EDITOR and above

// Karma-based role promotion configuration
export const KARMA_ROLE_THRESHOLDS = {
	[UserRole.EDITOR]: 100, // 100 karma points to become EDITOR
	[UserRole.MODERATOR]: 2000, // 2000 karma points to become MODERATOR
	// Note: ADMIN and SUPER_ADMIN cannot be achieved through karma
} as const;

// Get the next role milestone for a user
export function getNextRoleMilestone(
	currentKarma: number,
	currentRole: UserRole,
): {
	nextRole: UserRole | null;
	requiredKarma: number;
	progress: number;
} {
	// Users cannot be promoted to ADMIN or SUPER_ADMIN through karma
	const promotableRoles = [UserRole.EDITOR, UserRole.MODERATOR];

	// Find the next role the user can achieve
	for (const role of promotableRoles) {
		const requiredKarma =
			KARMA_ROLE_THRESHOLDS[role as keyof typeof KARMA_ROLE_THRESHOLDS];
		const currentHierarchy = getRoleHierarchy(currentRole);
		const targetHierarchy = getRoleHierarchy(role);

		// Only promote to higher roles
		if (targetHierarchy > currentHierarchy && currentKarma <= requiredKarma) {
			const progress = Math.min((currentKarma / requiredKarma) * 100, 100);
			return {
				nextRole: role,
				requiredKarma,
				progress,
			};
		}
	}

	// User has reached maximum promotable role
	return {
		nextRole: null,
		requiredKarma: 0,
		progress: 100,
	};
}

// Get all role milestones for display
export function getRoleMilestones(): Array<{
	role: UserRole;
	requiredKarma: number;
	description: string;
}> {
	return [
		{
			role: UserRole.EDITOR,
			requiredKarma: KARMA_ROLE_THRESHOLDS[UserRole.EDITOR],
			description: "Can view and approve post edits",
		},
		{
			role: UserRole.MODERATOR,
			requiredKarma: KARMA_ROLE_THRESHOLDS[UserRole.MODERATOR],
			description: "Can delete comments, remove posts, and moderate content",
		},
	];
}

// Check if user should be promoted based on karma
export function shouldPromoteUser(
	currentKarma: number,
	currentRole: UserRole,
): {
	shouldPromote: boolean;
	newRole: UserRole | null;
} {
	const { nextRole } = getNextRoleMilestone(currentKarma, currentRole);

	if (!nextRole) {
		return { shouldPromote: false, newRole: null };
	}

	const requiredKarma =
		KARMA_ROLE_THRESHOLDS[nextRole as keyof typeof KARMA_ROLE_THRESHOLDS];
	const shouldPromote = currentKarma >= requiredKarma;

	return {
		shouldPromote,
		newRole: shouldPromote ? nextRole : null,
	};
}

/**
 * Get the hierarchy level for a given role
 */
export function getRoleHierarchy(role: UserRole): number {
	return ROLE_HIERARCHY[role] ?? 0;
}

/**
 * Check if a user has admin access (ADMIN or SUPER_ADMIN)
 */
export function hasAdminAccess(userRole?: UserRole): boolean {
	if (!userRole) return false;
	return getRoleHierarchy(userRole) >= ADMIN_ACCESS_LEVEL;
}

/**
 * Check if a user has moderator access (MODERATOR, ADMIN, or SUPER_ADMIN)
 */
export function hasModeratorAccess(userRole?: UserRole): boolean {
	if (!userRole) return false;
	return getRoleHierarchy(userRole) >= MODERATOR_ACCESS_LEVEL;
}

/**
 * Check if a user has editor access (EDITOR, MODERATOR, ADMIN, or SUPER_ADMIN)
 */
export function hasEditorAccess(userRole?: UserRole): boolean {
	if (!userRole) return false;
	return getRoleHierarchy(userRole) >= EDITOR_ACCESS_LEVEL;
}

/**
 * Check if current user can modify target user's role
 * Users can only modify roles with lower hierarchy levels
 */
export function canModifyRole(
	currentUserRole?: UserRole,
	targetUserRole?: UserRole,
): boolean {
	if (!currentUserRole || !targetUserRole) return false;

	const currentHierarchy = getRoleHierarchy(currentUserRole);
	const targetHierarchy = getRoleHierarchy(targetUserRole);

	// Can only modify users with lower hierarchy
	return currentHierarchy > targetHierarchy;
}

/**
 * Get available roles that current user can assign
 */
export function getAvailableRoles(currentUserRole?: UserRole): UserRole[] {
	if (!currentUserRole) return [];

	const currentHierarchy = getRoleHierarchy(currentUserRole);

	return Object.values(UserRole).filter((role) => {
		const roleHierarchy = getRoleHierarchy(role);
		return roleHierarchy < currentHierarchy;
	});
}

/**
 * Check if a user can access a specific feature based on minimum required level
 */
export function canAccessFeature(
	requiredLevel: number,
	userRole?: UserRole,
): boolean {
	if (!userRole) return false;
	return getRoleHierarchy(userRole) >= requiredLevel;
}

/**
 * Get all roles that have access to a specific feature level
 */
export function getRolesWithAccess(requiredLevel: number): UserRole[] {
	return Object.values(UserRole).filter(
		(role) => getRoleHierarchy(role) >= requiredLevel,
	);
}

/**
 * Check if user has at least the specified role level
 */
export function hasRoleLevel(
	requiredRole: UserRole,
	userRole?: UserRole,
): boolean {
	if (!userRole) return false;
	return getRoleHierarchy(userRole) >= getRoleHierarchy(requiredRole);
}
