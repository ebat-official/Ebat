"use server";
import { UNAUTHENTICATED_ERROR, ValidationErr } from "@/utils/errors";
import { z } from "zod";
import { getCurrentUser, validateUser } from "./user";
import { VoteType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { GenerateActionReturnType } from "@/utils/types";
import { SUCCESS } from "@/utils/contants";

const VoteValidator = z.object({
	postId: z.string(),
	type: z.union([z.nativeEnum(VoteType), z.null()]),
});

export async function voteAction(
	data: z.infer<typeof VoteValidator>,
): Promise<GenerateActionReturnType<string>> {
	const validatedData = VoteValidator.parse(data);

	if (!validatedData) throw ValidationErr("Invalid vote data");
	const user = await validateUser();

	if (!user) return UNAUTHENTICATED_ERROR;

	const voteData = {
		postId: data.postId,
		type: data.type,
		userId: user.id,
	};

	if (voteData.type === null) {
		// Delete the vote if type is null
		await prisma.vote.delete({
			where: {
				userId_postId: {
					userId: voteData.userId,
					postId: voteData.postId,
				},
			},
		});
	} else {
		// Upsert the vote if type is "UP" or "DOWN"
		await prisma.vote.upsert({
			where: {
				userId_postId: {
					userId: voteData.userId,
					postId: voteData.postId,
				},
			},
			update: {
				type: voteData.type as VoteType,
			},
			create: {
				userId: voteData.userId,
				postId: voteData.postId,
				type: voteData.type as VoteType,
			},
		});
	}
	return { status: SUCCESS, data: SUCCESS };
}
