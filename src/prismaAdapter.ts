// Prisma instance to ensure only one instance is created throughout the project
import { PrismaClient } from "@prisma/client";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { generateUniqueUsername } from "./lib/generateUniqueUsername";
import type { AdapterUser } from "next-auth/adapters";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

export const prismaCustomAdapter = () => {
	const adapter = PrismaAdapter(prisma);
	return {
		...adapter,
		async createUser(user: AdapterUser) {
			const userName = generateUniqueUsername(user.email);
			const { image, name, ...otherUserDetails } = user;

			try {
				const userDetails = await prisma.$transaction(async (prisma) => {
					const createdUser = await prisma.user.create({
						data: {
							...otherUserDetails,
							userName,
						},
					});

					const userProfile = await prisma.userProfile.create({
						data: {
							userId: createdUser.id,
							image: image || null, // Explicitly set to null if undefined
							name: name || null,
							email: createdUser.email,
						},
					});

					return { ...createdUser, userProfile };
				});

				return userDetails;
			} catch (error) {
				console.error("Error creating user and profile:", error);
				throw new Error("Failed to create user and profile.");
			}
		},
	};
};

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
