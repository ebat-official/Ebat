import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	baseURL: process.env.BETTER_AUTH_URL, // Optional: BetterAuth can auto-detect in most cases
	plugins: [adminClient()],
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
