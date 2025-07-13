"use server";
import bcrypt from "bcryptjs";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { User } from "@/db/schema/zod-schemas";
import { auth } from "@/auth";
import { headers } from "next/headers";

// Note: UserWithProfile type removed - profile fields now in users table

/**
 *
 * @param email
 * @returns
 * this function is used to find user by email from server side
 * this will include password and other sensitive information
 */
export async function findUserByEmailServer(email: string) {
	try {
		const foundUser = await db.query.user.findFirst({
			where: eq(user.email, email),
		});
		return foundUser;
	} catch (error) {
		return null;
	}
}

export async function findUserByEmail(email: string) {
	try {
		const foundUser = await db.query.user.findFirst({
			where: eq(user.email, email),
			columns: {
				id: true,
				email: true,
				userName: true,
				emailVerified: true,
				role: true,
				karmaPoints: true,
				accountStatus: true,
			},
			// Note: profile relation removed - fields now in users table
		});
		return foundUser;
	} catch (error) {
		return null;
	}
}

export async function findUserById(id: string): Promise<User | null> {
	try {
		const foundUser = await db.query.user.findFirst({
			where: eq(user.id, id),
			columns: {
				id: true,
				email: true,
				userName: true,
				emailVerified: true,
				role: true,
				karmaPoints: true,
				accountStatus: true,
				name: true,
				image: true,
				companyName: true,
				jobTitle: true,
				description: true,
				location: true,
				coverImage: true,
				externalLinks: true,
			},
			// Note: profile relation removed - all fields now in users table
		});

		return foundUser as User | null;
	} catch (error) {
		console.error("Error finding user by ID:", error);
		return null;
	}
}

export async function validateUser() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	return session?.user;
}

export async function getCurrentUser() {
	const user = await validateUser();
	if (!user?.id) return null;

	const foundUser = await findUserById(user.id);
	return foundUser;
}

export async function updateUserPassword(email: string, password: string) {
	try {
		// First find the user by email to get their ID
		const foundUser = await findUserByEmailServer(email);
		if (!foundUser) {
			return null;
		}

		const ctx = await auth.$context;
		const hash = await ctx.password.hash(password);
		await ctx.internalAdapter.updatePassword(foundUser.id, hash);
		return true;
	} catch (error) {
		return null;
	}
}

export async function updateUserCoins(userId: string, coins: number) {
	try {
		await db.update(user).set({ coins }).where(eq(user.id, userId));
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
		await db.update(user).set({ karmaPoints }).where(eq(user.id, userId));
		return true;
	} catch (error) {
		return null;
	}
}
