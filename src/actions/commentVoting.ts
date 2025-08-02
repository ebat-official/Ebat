"use server";
import { db } from "@/db";
import { commentVotes } from "@/db/schema";
import { VoteType } from "@/db/schema/enums";
import { invalidateCommentsCache } from "@/lib/invalidateCache";
import { SUCCESS } from "@/utils/constants";
import {
	UNAUTHENTICATED_ERROR,
	VALIDATION_ERROR,
	RATE_LIMIT_ERROR,
} from "@/utils/errors";
import { GenerateActionReturnType } from "@/utils/types";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { validateUser } from "./user";
import {
	rateLimit,
	InteractionActions,
	RateLimitCategory,
} from "@/lib/rateLimit";

const CommentVoteValidator = z.object({
	postId: z.string(),
	commentId: z.string(),
	type: z.nativeEnum(VoteType).nullable(),
});

export async function CommentVoteAction(
	data: z.infer<typeof CommentVoteValidator>,
): Promise<GenerateActionReturnType<string>> {
	// Rate limiting
	const rateLimitResult = await rateLimit(
		RateLimitCategory.INTERACTIONS,
		InteractionActions.VOTE,
	);
	if (!rateLimitResult.success) {
		return RATE_LIMIT_ERROR;
	}

	const validatedData = CommentVoteValidator.parse(data);

	if (!validatedData) return VALIDATION_ERROR;
	const user = await validateUser();

	if (!user) return UNAUTHENTICATED_ERROR;

	const voteData = {
		commentId: data.commentId,
		type: data.type,
		userId: user.id,
	};

	if (voteData.type === null) {
		// Delete the vote if type is null
		await db
			.delete(commentVotes)
			.where(
				and(
					eq(commentVotes.userId, voteData.userId),
					eq(commentVotes.commentId, voteData.commentId),
				),
			);
	} else {
		// Upsert the vote if type is "up" or "down"
		await db
			.insert(commentVotes)
			.values({
				userId: voteData.userId,
				commentId: voteData.commentId,
				type: voteData.type,
			})
			.onConflictDoUpdate({
				target: [commentVotes.userId, commentVotes.commentId],
				set: { type: voteData.type },
			});
	}
	invalidateCommentsCache(data.postId);
	return { status: SUCCESS, data: SUCCESS };
}
