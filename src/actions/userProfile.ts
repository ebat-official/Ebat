"use server";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function findUserProfile(userId: string) {
	try {
		const userProfile = await db.query.userProfiles.findFirst({
			where: eq(userProfiles.userId, userId),
		});
		return userProfile;
	} catch (error) {
		return null;
	}
}

export async function findUserProfileByEmail(email: string) {
	try {
		const userProfile = await db.query.userProfiles.findFirst({
			where: eq(userProfiles.email, email),
		});
		return userProfile;
	} catch (error) {
		return null;
	}
}
