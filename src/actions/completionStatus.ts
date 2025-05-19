"use server";
import prisma from "@/lib/prisma";
import { CompletionStatus } from "@prisma/client";
import { z } from "zod";
import { validateUser } from "./user";

// Utility type for input pairs
const CompletionStatusPairsValidator = z.array(
	z.object({
		postId: z.string(),
		userId: z.string(),
	}),
);

type CompletionStatusPair = z.infer<
	typeof CompletionStatusPairsValidator
>[number];

// Validator for postId array
const CompletionStatusPostIdsValidator = z.array(z.string());

type CompletionStatusPostId = z.infer<
	typeof CompletionStatusPostIdsValidator
>[number];

// Fetch CompletionStatus for an array of postIds for the current user
export async function getCompletionStatusesForPosts(
	postIds: CompletionStatusPostId[],
): Promise<CompletionStatus[]> {
	if (!postIds.length) return [];
	const user = await validateUser();
	if (!user) return [];

	return prisma.completionStatus.findMany({
		where: {
			userId: user.id,
			postId: { in: postIds },
		},
	});
}
