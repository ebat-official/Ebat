import { adminClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: process.env.BETTER_AUTH_URL, // Optional: BetterAuth can auto-detect in most cases
	plugins: [adminClient(), usernameClient()],
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
} = authClient;

// Export the session type inferred from Better Auth
export type Session = typeof authClient.$Infer.Session;
