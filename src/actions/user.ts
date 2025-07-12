"use server";
import bcrypt from "bcryptjs";

import { db } from "@/db";
import { users, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { User, Profile } from "@/db/schema/zod-schemas";
import { validateVerificationToken } from "./auth";
import { auth } from "@/auth";

type UserWithProfile = User & { profile: Profile | null };

/**
 *
 * @param email
 * @returns
 * this function is used to find user by email from server side
 * this will include password and other sensitive information
 */
export async function findUserByEmailServer(email: string) {
	try {
		const user = await db.query.users.findFirst({
			where: eq(users.email, email),
		});
		return user;
	} catch (error) {
		return null;
	}
}

export async function findUserByEmail(email: string) {
	try {
		const user = await db.query.users.findFirst({
			where: eq(users.email, email),
			columns: {
				id: true,
				email: true,
				userName: true,
				emailVerified: true,
				role: true,
				karmaPoints: true,
				accountStatus: true,
			},
			with: {
				profile: {
					columns: {
						name: true,
						id: true,
						image: true,
					},
				},
			},
		});
		return user;
	} catch (error) {
		return null;
	}
}

export async function findUserById(
	id: string,
	includeProfile = false,
): Promise<User | UserWithProfile | null> {
	try {
		const user = await db.query.users.findFirst({
			where: eq(users.id, id),
			columns: {
				id: true,
				email: true,
				userName: true,
				emailVerified: true,
				role: true,
				karmaPoints: true,
				accountStatus: true,
			},
			with: includeProfile
				? {
						profile: true,
					}
				: undefined,
		});

		return user as UserWithProfile | User | null;
	} catch (error) {
		console.error("Error finding user by ID:", error);
		return null;
	}
}

export async function validateUser() {
	const session = await auth();
	if (!session?.user?.id) return null;

	const user = await findUserById(session.user.id);
	return user;
}

export async function getCurrentUser() {
	const session = await auth();
	if (!session?.user?.id) return null;

	const user = await findUserById(session.user.id, true);
	return user;
}

export async function setEmailVerifiedUsingToken(token: string) {
	const user = await validateVerificationToken(token);

	if (typeof user.data !== "object" || !("email" in user.data)) {
		return null;
	}

	try {
		await db
			.update(users)
			.set({ emailVerified: new Date() })
			.where(eq(users.email, user.data.email));
		return true;
	} catch (error) {
		return null;
	}
}

export async function updateUserPassword(email: string, password: string) {
	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		await db
			.update(users)
			.set({ password: hashedPassword })
			.where(eq(users.email, email));
		return true;
	} catch (error) {
		return null;
	}
}

export async function updateUserCoins(userId: string, coins: number) {
	try {
		await db.update(users).set({ coins }).where(eq(users.id, userId));
		return true;
	} catch (error) {
		return null;
	}
}

export async function updateUserKarmaPoints(
	userId: string,
	karmaPoints: number,
) {
	try {
		await db.update(users).set({ karmaPoints }).where(eq(users.id, userId));
		return true;
	} catch (error) {
		return null;
	}
}

export async function setEmailVerified(userId: string) {
	try {
		await db
			.update(users)
			.set({ emailVerified: new Date() })
			.where(eq(users.id, userId));
		return true;
	} catch (error) {
		console.error("Error setting email verified:", error);
		return null;
	}
}
