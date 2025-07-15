import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";
import {
	apiAuthRoutes,
	authRoutes,
	defaultLoginRedirect,
	privateRoutes,
} from "./utils/routes";

export default async function middleware(request: NextRequest) {
	const { nextUrl } = request;
	const sessionCookie = getSessionCookie(request);
	const isLoggedIn = !!sessionCookie;

	//api authentication URL shouldnt be blocked
	if (nextUrl.pathname.startsWith(apiAuthRoutes)) return;

	// if (authRoutes.includes(nextUrl.pathname)) {
	//   if (isLoggedIn) {
	//     const absoluteURL = new URL(defaultLoginRedirect, nextUrl);
	//     return Response.redirect(absoluteURL);
	//   }
	//   return;
	// }

	if (!isLoggedIn && privateRoutes.includes(nextUrl.pathname)) {
		return NextResponse.redirect(new URL("/signin", nextUrl));
	}

	return NextResponse.next();
}

export const config = {
	// runtime: "nodejs",
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
