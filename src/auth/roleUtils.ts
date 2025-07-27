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
