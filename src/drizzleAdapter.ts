import { db } from "@/db";
import { users, userProfiles, accounts, verificationTokens } from "@/db/schema";
import { generateUniqueUsername } from "@/lib/generateUniqueUsername";
import type { AdapterUser } from "next-auth/adapters";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

// Simple custom adapter that matches the original Prisma adapter pattern
export function drizzleCustomAdapter() {
	const adapter = DrizzleAdapter(db);
	return {
		...adapter,
		async createUser(user: AdapterUser) {
			const userName = generateUniqueUsername(user.email);
			const { image, name, ...otherUserDetails } = user;

			try {
				const userDetails = await db.transaction(async (tx) => {
					const [createdUser] = await tx
						.insert(users)
						.values({
							...otherUserDetails,
							userName,
						})
						.returning();

					const [userProfile] = await tx
						.insert(userProfiles)
						.values({
							userId: createdUser.id,
							image: image || null,
							name: name || null,
							email: createdUser.email,
						})
						.returning();

					return { ...createdUser, userProfile };
				});

				return userDetails;
			} catch (error) {
				console.error("Error creating user and profile:", error);
				throw new Error("Failed to create user and profile.");
			}
		},
	};
}
