import { usePathname } from "next/navigation";

/**
 * Configuration for sidebar hiding logic
 */
export const sidebarConfig = {
	parentRoute: "challenges", // Parent route to check (note: plural)
	excludePaths: ["/create/", "/edit/"], // Sub-paths where sidebar should be visible (with trailing slash!)
};

/**
 * Utility to determine if the sidebar should be hidden based on current route
 * Returns true if sidebar should be HIDDEN, false if it should be VISIBLE
 *
 * Logic: Hide sidebar ONLY for challenge sub-routes that are NOT in exclude list
 */
export const useMobileSidebar = (): boolean => {
	const pathname = usePathname();

	if (!pathname) return false; // Show sidebar if no pathname

	const { parentRoute, excludePaths } = sidebarConfig;

	// Build single regex pattern to match all cases where sidebar should be VISIBLE
	const excludePattern = excludePaths
		.map((path) => `${path.replace(/^\//, "").replace(/\/$/, "")}(?:/.*)?`)
		.join("|");

	// Single regex that matches:
	// 1. Exact parent: .../challenges or .../challenges/
	// 2. Excluded paths: .../challenges/create/anything or .../challenges/edit/anything
	const showSidebarRegex = new RegExp(
		`\\/${parentRoute}(?:\\/?$|\\/(${excludePattern})$)`,
	);

	// If matches show pattern, show sidebar
	if (showSidebarRegex.test(pathname)) {
		return false; // Show sidebar
	}

	// If contains parent route but doesn't match show pattern, hide sidebar
	const hasParentRoute = new RegExp(`\\/${parentRoute}\\/`).test(pathname);
	return hasParentRoute; // Hide if under parent, show otherwise
};
