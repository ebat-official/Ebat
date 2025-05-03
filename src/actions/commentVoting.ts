"use server";
import { UNAUTHENTICATED_ERROR, VALIDATION_ERROR } from "@/utils/errors";
import { z } from "zod";
import { validateUser } from "./user";
import { VoteType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { invalidateCommentsCache } from "@/lib/invalidateCache";
import { SUCCESS } from "@/utils/contants";
import { GenerateActionReturnType } from "@/utils/types";

const CommentVoteValidator = z.object({
	postId: z.string(),
	commentId: z.string(),
	type: z.union([z.nativeEnum(VoteType), z.null()]),
});

export async function CommentVoteAction(
	data: z.infer<typeof CommentVoteValidator>,
): Promise<GenerateActionReturnType<string>> {
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
		await prisma.commentVote.delete({
			where: {
				userId_commentId: {
					userId: voteData.userId,
					commentId: voteData.commentId,
				},
			},
		});
	} else {
		// Upsert the vote if type is "UP" or "DOWN"
		await prisma.commentVote.upsert({
			where: {
				userId_commentId: {
					userId: voteData.userId,
					commentId: voteData.commentId,
				},
			},
			update: {
				type: voteData.type as VoteType,
			},
			create: {
				userId: voteData.userId,
				commentId: voteData.commentId,
				type: voteData.type as VoteType,
			},
		});
	}
	invalidateCommentsCache(data.postId);
	return { status: SUCCESS, data: SUCCESS };
}
