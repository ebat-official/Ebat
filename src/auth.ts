import NextAuth, { type DefaultSession } from "next-auth";
import { UserRole, UserProfile } from "@prisma/client";
import { prismaCustomAdapter } from "@/prismaAdapter";
import authConfig from "@/utils/auth.config";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			role: UserRole;
			image: string | unknown;
		} & DefaultSession["user"]; // To keep the default types
		userProfile: UserProfile | null;
	}
	interface User {
		emailVerified: Date | null;
	}
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: prismaCustomAdapter(),
	session: { strategy: "jwt" },
	...authConfig,
});
