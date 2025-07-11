"use server";
import { db } from "@/db";
import { completionStatuses } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { CompletionStatus } from "@/db/schema/zod-schemas";
import { z } from "zod";
import { validateUser } from "./user";

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

	return await db.query.completionStatuses.findMany({
		where: and(
			eq(completionStatuses.userId, user.id),
			inArray(completionStatuses.postId, postIds),
		),
	});
}
