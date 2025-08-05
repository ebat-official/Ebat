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
import { awardKarma } from "@/utils/karmaUtils";
import { KarmaAction } from "@/db/schema/enums";
import { comments } from "@/db/schema";

const CommentVoteValidator = z.object({
	postId: z.string(),
	comment: z.object({
		id: z.string(),
		authorId: z.string(),
		content: z.any().optional(),
		createdAt: z.union([z.string(), z.date()]).optional(), // Accept both string and Date
		updatedAt: z.union([z.string(), z.date()]).optional(), // Accept both string and Date
		postId: z.string().optional(),
		parentId: z.string().nullable().optional(),
	}), // Required comment object
	type: z.nativeEnum(VoteType).nullable(),
	previousVoteType: z.nativeEnum(VoteType).optional(), // For vote removal
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
		commentId: data.comment.id, // Get commentId from comment object
		postId: data.postId,
		type: data.type,
		userId: user.id,
		previousVoteType: data.previousVoteType,
		comment: data.comment, // Use comment from client
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

		// Use comment data from client instead of database query
		if (
			voteData.comment?.authorId &&
			voteData.comment.authorId !== voteData.userId &&
			voteData.previousVoteType
		) {
			await awardKarma(
				voteData.comment.authorId,
				KarmaAction.COMMENT_VOTE_REMOVAL,
				0,
				{
					commentId: voteData.commentId,
					voteType: voteData.previousVoteType,
					postId: voteData.postId,
				},
			);
		}
	} else {
		// Upsert the vote if type is "up" or "down"
		await db
			.insert(commentVotes)
			.values({
				userId: voteData.userId,
				commentId: voteData.commentId,
				postId: voteData.postId,
				type: voteData.type,
			})
			.onConflictDoUpdate({
				target: [commentVotes.userId, commentVotes.commentId],
				set: { type: voteData.type },
			});

		// Use comment data from client instead of database query
		if (
			voteData.comment?.authorId &&
			voteData.comment.authorId !== voteData.userId
		) {
			await awardKarma(voteData.comment.authorId, KarmaAction.COMMENT_VOTE, 0, {
				commentId: voteData.commentId,
				voteType: voteData.type,
				postId: voteData.postId,
			});
		}
	}
	invalidateCommentsCache(data.postId);
	return { status: SUCCESS, data: SUCCESS };
}
