import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";
import { validateUser } from "./actions/user";
import { UserRole } from "./db/schema/enums";
import {
	adminRoutes,
	apiAuthRoutes,
	authRoutes,
	defaultLoginRedirect,
	privateRoutes,
} from "./utils/routes";

export default async function middleware(request: NextRequest) {
	const { nextUrl } = request;
	const sessionCookie = getSessionCookie(request);

	// Don't block API authentication routes
	if (nextUrl.pathname.startsWith(apiAuthRoutes)) {
		return NextResponse.next();
	}

	// Handle login page route - allow access regardless of auth status
	if (nextUrl.pathname === "/login") {
		return NextResponse.next();
	}

	// Handle auth routes (signin, signup, resetPassword)
	if (authRoutes.includes(nextUrl.pathname)) {
		// If user is logged in and tries to access auth routes, redirect to default
		if (sessionCookie) {
			return NextResponse.redirect(new URL(defaultLoginRedirect, nextUrl));
		}
		return NextResponse.next();
	}

	// Handle private routes - redirect to login page if no session cookie
	if (privateRoutes.some((route) => nextUrl.pathname.startsWith(route))) {
		if (!sessionCookie) {
			const loginUrl = new URL("/login", nextUrl);
			loginUrl.searchParams.set(
				"message",
				"Please sign in to access this page.",
			);
			return NextResponse.redirect(loginUrl);
		}
	}

	// // Handle admin routes - check if user is authenticated and has admin role
	// if (adminRoutes.some((route) => nextUrl.pathname.startsWith(route))) {
	// 	// If no session cookie, show 404 (don't reveal admin routes exist)
	// 	if (!sessionCookie) {
	// 		return NextResponse.rewrite(new URL("/not-found", nextUrl));
	// 	}

	// 	// Get user session to check role
	// 	try {
	// 		const user = await validateUser();

	// 		// If no valid user, show 404
	// 		if (!user) {
	// 			return NextResponse.rewrite(new URL("/not-found", nextUrl));
	// 		}

	// 		const userRole = user.role;
	// 		const isAdmin = userRole === UserRole.ADMIN;

	// 		// If not admin, show 404 (don't reveal admin routes exist)
	// 		if (!isAdmin) {
	// 			return NextResponse.rewrite(new URL("/not-found", nextUrl));
	// 		}
	// 	} catch (error) {
	// 		console.error("Error checking admin access:", error);
	// 		// On error, show 404 (don't reveal admin routes exist)
	// 		return NextResponse.rewrite(new URL("/not-found", nextUrl));
	// 	}
	// }

	return NextResponse.next();
}

export const config = {
	// runtime: "nodejs",
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
