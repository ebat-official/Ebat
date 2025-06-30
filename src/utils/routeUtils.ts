import { usePathname } from "next/navigation";

/**
 * Routes that should hide the sidebar on mobile/specific views
 */
export const mobileSidebarPaths = ["challenges"];

/**
 * Utility to determine if the sidebar should be hidden based on current route
 * Uses mobileSidebarPaths internally
 * @param includeParent - If true, also hide for parent routes like /challenges (default: false)
 * Returns true for routes that match the patterns
 */
export const useMobileSidebar = (includeParent = false): boolean => {
	const pathname = usePathname();

	if (!pathname) return false;

	// Check each route in mobileSidebarPaths
	for (const route of mobileSidebarPaths) {
		if (includeParent) {
			// Match both /route and /route/something
			// Pattern: /route or /route/ or /route/anything
			const parentPattern = new RegExp(`\\/${route}(?:\\/|$)`);
			if (parentPattern.test(pathname)) return true;
		} else {
			// Only match /route/something (with content after route)
			// Pattern: /route/non-empty-content
			const childPattern = new RegExp(`\\/${route}\\/[^/]+`);
			if (childPattern.test(pathname)) return true;
		}
	}

	return false;
};

/**
 * Alternative function if you want to pass pathname directly
 * Uses mobileSidebarPaths internally
 */
export const shouldHideSidebar = (
	pathname: string,
	includeParent = false,
): boolean => {
	if (!pathname) return false;

	// Check each route in mobileSidebarPaths
	for (const route of mobileSidebarPaths) {
		if (includeParent) {
			// Match both /route and /route/something
			const parentPattern = new RegExp(`\\/${route}(?:\\/|$)`);
			if (parentPattern.test(pathname)) return true;
		} else {
			// Only match /route/something (with content after route)
			const childPattern = new RegExp(`\\/${route}\\/[^/]+`);
			if (childPattern.test(pathname)) return true;
		}
	}

	return false;
};
