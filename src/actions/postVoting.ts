"use server";
import { db } from "@/db";
import { votes } from "@/db/schema";
import { VoteType } from "@/db/schema/enums";
import { SUCCESS } from "@/utils/constants";
import {
	UNAUTHENTICATED_ERROR,
	ValidationErr,
	RATE_LIMIT_ERROR,
} from "@/utils/errors";
import { GenerateActionReturnType } from "@/utils/types";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUser, validateUser } from "./user";
import {
	rateLimit,
	InteractionActions,
	RateLimitCategory,
} from "@/lib/rateLimit";
import { awardKarma } from "@/utils/karmaUtils";
import { KarmaAction } from "@/db/schema/enums";
import { posts } from "@/db/schema";

const VoteValidator = z.object({
	post: z.object({
		id: z.string(),
		authorId: z.string(),
		title: z.string().nullable().optional(),
		slug: z.string().nullable().optional(),
		type: z.any().optional(),
		category: z.any().optional(),
		subCategory: z.any().optional(),
		status: z.any().optional(),
		approvalStatus: z.any().optional(),
		createdAt: z.date().optional(),
		updatedAt: z.date().optional(),
	}), // Required post object
	type: z.nativeEnum(VoteType).nullable(),
	previousVoteType: z.nativeEnum(VoteType).optional(), // For vote removal
});

export async function voteAction(
	data: z.infer<typeof VoteValidator>,
): Promise<GenerateActionReturnType<string>> {
	// Rate limiting
	const rateLimitResult = await rateLimit(
		RateLimitCategory.INTERACTIONS,
		InteractionActions.VOTE,
	);
	if (!rateLimitResult.success) {
		return RATE_LIMIT_ERROR;
	}

	const validatedData = VoteValidator.parse(data);

	if (!validatedData) throw ValidationErr("Invalid vote data");
	const user = await validateUser();

	if (!user) return UNAUTHENTICATED_ERROR;

	const voteData = {
		postId: data.post.id, // Get postId from post object
		type: data.type,
		userId: user.id,
		previousVoteType: data.previousVoteType,
		post: data.post, // Use post from client
	};

	if (voteData.type === null) {
		// Delete the vote if type is null
		await db
			.delete(votes)
			.where(
				and(
					eq(votes.userId, voteData.userId),
					eq(votes.postId, voteData.postId),
				),
			);

		// Use post data from client instead of database query
		if (
			voteData.post?.authorId &&
			voteData.post.authorId !== voteData.userId &&
			voteData.previousVoteType
		) {
			await awardKarma(
				voteData.post.authorId,
				KarmaAction.POST_VOTE_REMOVAL,
				0,
				{
					postId: voteData.postId,
					voteType: voteData.previousVoteType,
				},
			);
		}
	} else {
		// Upsert the vote if type is "up" or "down"
		await db
			.insert(votes)
			.values({
				userId: voteData.userId,
				postId: voteData.postId,
				type: voteData.type,
			})
			.onConflictDoUpdate({
				target: [votes.userId, votes.postId],
				set: { type: voteData.type },
			});

		// Use post data from client instead of database query
		if (voteData.post?.authorId && voteData.post.authorId !== voteData.userId) {
			await awardKarma(voteData.post.authorId, KarmaAction.POST_VOTE, 0, {
				postId: voteData.postId,
				voteType: voteData.type,
			});
		}
	}
	return { status: SUCCESS, data: SUCCESS };
}
