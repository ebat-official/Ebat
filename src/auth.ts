import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance
import { authSchema } from "@/db/schema/auth";
import { EMAIL_VALIDATION, RESET_PASSWORD } from "@/utils/contants";
import mailer from "@/lib/mailer";
import { AccountStatus, UserRole } from "./db/schema";
import { generateUniqueUsername } from "@/lib/generateUniqueUsername";
import { admin, openAPI } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: authSchema,
	}),
	advanced: {
		database: {
			generateId: false,
		},
	},
	account: {
		accountLinking: {
			enabled: true,
		},
	},
	user: {
		additionalFields: {
			userName: {
				type: "string",
				required: false,
				input: true,
			},
			role: {
				type: "string",
				required: false,
				defaultValue: UserRole.USER,
				input: false, // don't allow user to set role
			},
			accountStatus: {
				type: "string",
				required: false,
				defaultValue: AccountStatus.ACTIVE,
				input: false, // don't allow user to set account status
			},
			karmaPoints: {
				type: "number",
				required: false,
				defaultValue: 0,
				input: false, // don't allow user to set karma points
			},
			coins: {
				type: "number",
				required: false,
				defaultValue: 0,
				input: false, // don't allow user to set coins
			},
			lastLoginAt: {
				type: "date",
				required: false,
				input: false, // automatically managed
			},
			subscriptionPlan: {
				type: "string",
				required: false,
				input: false,
			},
		},
	},
	databaseHooks: {
		user: {
			create: {
				before: async (user, ctx) => {
					// Generate unique username from email
					const userName = generateUniqueUsername(user.email);

					return {
						data: {
							...user,
							userName,
						},
					};
				},
			},
		},
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url, token }, request) => {
			try {
				await mailer(user.email, RESET_PASSWORD, url);
			} catch (error) {
				console.error("Failed to send password reset email:", error);
				throw error;
			}
		},
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url, token }, request) => {
			try {
				await mailer(user.email, EMAIL_VALIDATION, url);
			} catch (error) {
				console.error("Failed to send verification email:", error);
				throw error;
			}
		},
		autoSignInAfterVerification: true,
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		},
		github: {
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
		},
		linkedin: {
			clientId: process.env.LINKEDIN_CLIENT_ID!,
			clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
		},
	},
	plugins: [openAPI(), admin(), nextCookies()],
	trustedOrigins:
		process.env.NODE_ENV === "production"
			? ["*.ebat.dev", "*.ebat.vercel.app"]
			: ["http://localhost:3000"],
});
