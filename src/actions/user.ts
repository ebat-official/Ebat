"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { User } from "@/db/schema/zod-schemas";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function findUserById(id: string): Promise<User | null> {
	try {
		const foundUser = await db.query.user.findFirst({
			where: eq(user.id, id),
			columns: {
				id: true,
				email: true,
				username: true,
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
