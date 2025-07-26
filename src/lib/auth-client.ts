import { adminClient, usernameClient } from "better-auth/client/plugins";
import { admin } from "better-auth/plugins";
import { createAuthClient } from "better-auth/react";
import {
	ac,
	admin as adminRole,
	user,
	editor,
	moderator,
} from "@/auth/permissions";
export const authClient = createAuthClient({
	baseURL: process.env.BETTER_AUTH_URL, // Optional: BetterAuth can auto-detect in most cases
	plugins: [
		adminClient(),
		usernameClient(),
		admin({
			ac,
			roles: {
				admin: adminRole,
				user,
				editor,
				moderator,
			},
		}),
	],
});

// Export specific methods for convenience
export const {
	signIn,
	signUp,
	signOut,
	useSession,
	getSession,
	verifyEmail,
	sendVerificationEmail,
	resetPassword,
	changePassword,
	isUsernameAvailable,
	updateUser,
} = authClient;

// Export the session type inferred from Better Auth
export type Session = typeof authClient.$Infer.Session;
