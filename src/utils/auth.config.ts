import type { NextAuthConfig } from "next-auth";
import { authFormSchema } from "@/lib/validators/authForm";
import {
	findUserByEmailServer,
	findUserById,
	setEmailVerified,
} from "@/actions/user";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Linkedin from "next-auth/providers/linkedin";
import { EMAIL_NOT_VERIFIED } from "@/utils/contants";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { UserRole, UserProfile } from "@prisma/client";

export default {
	trustHost: true,
	events: {
		async linkAccount({ user }) {
			await setEmailVerified(user.email!);
		},
	},
	callbacks: {
		async signIn({ user, account, email, ...rem }) {
			//allow signin iff email verified
			if (account?.provider === "credentials" && !user.emailVerified) {
				throw new Error(EMAIL_NOT_VERIFIED);
			}
			return true;
		},
		async jwt({ token, account }) {
			if (!token.sub) return token;

			const user = await findUserById(token.sub, true);
			if (!user) return token;
			token.role = user.role;
			if (user && "userProfile" in user) {
				token.image = user?.userProfile?.image;
				token.name = user?.userProfile?.name;
			}
			return token;
		},
		async session({ token, session }) {
			if (session.user) {
				session.user.id = token.sub || "";
				session.user.role = token.role as UserRole;
				session.user.image = token.image as string;
				session.user.name = token.name as string;
			}
			return session;
		},
	},
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			allowDangerousEmailAccountLinking: true,
		}),
		GitHub({
			clientId: process.env.AUTH_GITHUB_ID,
			clientSecret: process.env.AUTH_GITHUB_SECRET,
			allowDangerousEmailAccountLinking: true,
		}),

		Linkedin({
			clientId: process.env.LINKEDIN_CLIENT_ID,
			clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
			allowDangerousEmailAccountLinking: true,
		}),

		Credentials({
			authorize: async (credentials) => {
				let user = null;
				const validateFields = authFormSchema.safeParse(credentials);
				if (!validateFields.success) {
					throw new Error("Invalid input data");
				}
				const { email, password } = validateFields.data;
				user = await findUserByEmailServer(email);
				if (!user || !user.password) {
					throw new Error("User email or password is incorrect");
				}
				const passwordMatch = await bcrypt.compare(password, user.password);
				if (!passwordMatch) {
					throw new Error("User email or password is incorrect");
				}
				return user;
			},
		}),
	],
	cookies: {
		pkceCodeVerifier: {
			name: "next-auth.pkce.code_verifier",
			options: {
				httpOnly: true,
				sameSite: "none",
				path: "/",
				secure: true,
			},
		},
	},
} satisfies NextAuthConfig;
