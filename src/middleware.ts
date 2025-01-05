import { auth as middleware } from "@/auth";
import { apiAuthRoutes, authRoutes, defaultLoginRedirect, privateRoutes } from "./utils/routes";

export default middleware((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  //api authentication URL shouldnt be blocked
  if (nextUrl.pathname.startsWith(apiAuthRoutes)) return;

  if (authRoutes.includes(nextUrl.pathname)) {
    if (isLoggedIn) {
      const absoluteURL = new URL(defaultLoginRedirect, nextUrl);
      return Response.redirect(absoluteURL);
    }
    return;
  }

  if (!isLoggedIn && privateRoutes.includes(nextUrl.pathname)) {
    const absoluteURL = new URL("/signin", nextUrl);
    return Response.redirect(absoluteURL);
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
