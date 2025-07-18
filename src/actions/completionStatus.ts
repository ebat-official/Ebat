"use server";
import { db } from "@/db";
import { completionStatuses } from "@/db/schema";
import { CompletionStatus } from "@/db/schema/zod-schemas";
import { and, eq, inArray } from "drizzle-orm";
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

// Create a completion status for a post
export async function createCompletionStatus(
	postId: CompletionStatusPostId,
): Promise<CompletionStatus> {
	const user = await validateUser();
	if (!user) throw new Error("User not authenticated");

	// Check if completion status already exists
	const existing = await db.query.completionStatuses.findFirst({
		where: and(
			eq(completionStatuses.userId, user.id),
			eq(completionStatuses.postId, postId),
		),
	});

	if (existing) {
		return existing;
	}

	// Create new completion status
	const [newStatus] = await db
		.insert(completionStatuses)
		.values({
			userId: user.id,
			postId,
			completedAt: new Date(),
		})
		.returning();

	return newStatus;
}

// Delete a completion status for a post
export async function deleteCompletionStatus(
	postId: CompletionStatusPostId,
): Promise<void> {
	const user = await validateUser();
	if (!user) throw new Error("User not authenticated");

	await db
		.delete(completionStatuses)
		.where(
			and(
				eq(completionStatuses.userId, user.id),
				eq(completionStatuses.postId, postId),
			),
		);
}
