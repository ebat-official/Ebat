"use server";
import { db } from "@/db";
import { completionStatuses } from "@/db/schema";
import { CompletionStatus } from "@/db/schema/zod-schemas";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { validateUser } from "./user";
import { rateLimit, ContentActions, RateLimitCategory } from "@/lib/rateLimit";
import { UNAUTHENTICATED_ERROR, RATE_LIMIT_ERROR } from "@/utils/errors";
import { ERROR, SUCCESS } from "@/utils/constants";
import { GenerateActionReturnType } from "@/utils/types";

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
): Promise<GenerateActionReturnType<CompletionStatus>> {
	// Rate limiting
	const rateLimitResult = await rateLimit(
		RateLimitCategory.CONTENT,
		ContentActions.TOGGLE_COMPLETION,
	);
	if (!rateLimitResult.success) {
		return RATE_LIMIT_ERROR;
	}

	const user = await validateUser();
	if (!user) return UNAUTHENTICATED_ERROR;

	// Check if completion status already exists
	const existing = await db.query.completionStatuses.findFirst({
		where: and(
			eq(completionStatuses.userId, user.id),
			eq(completionStatuses.postId, postId),
		),
	});

	if (existing) {
		return {
			status: SUCCESS,
			data: existing,
		};
	}

	try {
		// Create new completion status
		const [newStatus] = await db
			.insert(completionStatuses)
			.values({
				userId: user.id,
				postId,
				completedAt: new Date(),
			})
			.returning();

		return {
			status: SUCCESS,
			data: newStatus,
		};
	} catch (error) {
		console.error("Failed to create completion status:", error);
		return {
			status: ERROR,
			data: { message: "Failed to create completion status" },
		};
	}
}

// Delete a completion status for a post
export async function deleteCompletionStatus(
	postId: CompletionStatusPostId,
): Promise<GenerateActionReturnType<{ success: boolean }>> {
	// Rate limiting
	const rateLimitResult = await rateLimit(
		RateLimitCategory.CONTENT,
		ContentActions.TOGGLE_COMPLETION,
	);
	if (!rateLimitResult.success) {
		return RATE_LIMIT_ERROR;
	}

	const user = await validateUser();
	if (!user) return UNAUTHENTICATED_ERROR;

	try {
		await db
			.delete(completionStatuses)
			.where(
				and(
					eq(completionStatuses.userId, user.id),
					eq(completionStatuses.postId, postId),
				),
			);

		return {
			status: SUCCESS,
			data: { success: true },
		};
	} catch (error) {
		console.error("Failed to delete completion status:", error);
		return {
			status: ERROR,
			data: { message: "Failed to delete completion status" },
		};
	}
}
