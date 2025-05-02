"use server";
import { UserNotAuthenticatedErr, ValidationErr } from "@/utils/errors";
import { z } from "zod";
import { getCurrentUser } from "./user";
import { VoteType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { invalidateCommentsCache } from "@/lib/invalidateCache";

const CommentVoteValidator = z.object({
	postId: z.string(),
	commentId: z.string(),
	type: z.union([z.nativeEnum(VoteType), z.null()]),
});

const validateUser = async () => {
	const user = await getCurrentUser();
	if (!user) throw UserNotAuthenticatedErr();
	return user;
};
export async function CommentVoteAction(
	data: z.infer<typeof CommentVoteValidator>,
) {
	const validatedData = CommentVoteValidator.parse(data);

	if (!validatedData) throw ValidationErr("Invalid vote data");
	const user = await validateUser();

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
}
