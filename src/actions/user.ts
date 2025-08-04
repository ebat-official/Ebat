"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { User } from "@/db/schema/zod-schemas";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { z } from "zod";
import { UNAUTHENTICATED_ERROR, VALIDATION_ERROR } from "@/utils/errors";
import { SUCCESS, ERROR } from "@/utils/constants";
import { GenerateActionReturnType } from "@/utils/types";

const ProfileFormSchema = z.object({
	name: z.string().min(2).max(30).optional(),
	email: z.string().email().optional(),
	bio: z.string().max(160).optional(),
	urls: z
		.array(
			z.object({
				value: z.string().refine((value) => {
					if (!value) return true; // Allow empty values
					// Check if it's a valid URL with or without protocol
					try {
						// If it doesn't start with http/https, add https://
						const urlToTest =
							value.startsWith("http://") || value.startsWith("https://")
								? value
								: `https://${value}`;
						new URL(urlToTest);
						return true;
					} catch {
						return false;
					}
				}, "Please enter a valid URL (protocol optional)."),
				type: z.string().optional(),
			}),
		)
		.optional(),
	company: z.string().optional(),
	currentPosition: z.string().optional(),
	experience: z.number().min(0).max(50).optional(),
});

type ProfileFormValues = z.infer<typeof ProfileFormSchema>;

export type { ProfileFormValues };

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
				experience: true,
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

export async function updateUserProfile(
	data: ProfileFormValues,
): Promise<GenerateActionReturnType<User>> {
	const userSession = await validateUser();
	if (!userSession?.id) {
		return UNAUTHENTICATED_ERROR;
	}

	const parsed = ProfileFormSchema.safeParse(data);
	if (!parsed.success) {
		return VALIDATION_ERROR;
	}

	const { name, bio, urls, company, currentPosition, experience } = parsed.data;

	// Normalize URLs by adding https:// protocol if missing
	const normalizedUrls = urls?.map((urlObj) => ({
		...urlObj,
		value:
			urlObj.value &&
			!urlObj.value.startsWith("http://") &&
			!urlObj.value.startsWith("https://")
				? `https://${urlObj.value}`
				: urlObj.value,
	}));

	try {
		await db
			.update(user)
			.set({
				name,
				description: bio,
				companyName: company,
				jobTitle: currentPosition,
				externalLinks: normalizedUrls,
				experience: experience,
			})
			.where(eq(user.id, userSession.id));

		const updatedUser = await findUserById(userSession.id);
		if (!updatedUser) {
			return {
				status: ERROR,
				data: { message: "Failed to fetch updated user profile" },
			};
		}

		return {
			status: SUCCESS,
			data: updatedUser,
		};
	} catch (error) {
		console.error("Failed to update user profile:", error);
		return {
			status: ERROR,
			data: { message: "Failed to update user profile" },
		};
	}
}
