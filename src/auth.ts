import NextAuth, { type DefaultSession } from "next-auth";
import { drizzleCustomAdapter } from "@/drizzleAdapter";
import authConfig from "@/utils/auth.config";
import type { User } from "@/db/schema/zod-schemas";
import type { UserProfile } from "@/db/schema/zod-schemas";
import type { UserRole } from "@/db/schema/enums";

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
	adapter: drizzleCustomAdapter(),
	session: { strategy: "jwt" },
	...authConfig,
});
