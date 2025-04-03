"use server";
import prisma from "@/lib/prisma";
export async function findUserProfile(userId: string) {
	try {
		const userProfile = await prisma.userProfile.findUnique({
			where: {
				userId,
			},
		});
		return userProfile;
	} catch (error) {
		return null;
	}
}
export async function findUserProfileByEmail(email: string) {
	try {
		const userProfile = await prisma.userProfile.findUnique({
			where: {
				email,
			},
		});
		return userProfile;
	} catch (error) {
		return null;
	}
}
