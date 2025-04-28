"use server";
import { UserNotAuthenticatedErr, ValidationErr } from "@/utils/errors";
import { z } from "zod";
import { getCurrentUser } from "./user";
import { VoteType } from "@prisma/client";
import prisma from "@/lib/prisma";

const VoteValidator = z.object({
	postId: z.string(),
	type: z.union([z.nativeEnum(VoteType), z.null()]),
});

const validateUser = async () => {
	const user = await getCurrentUser();
	if (!user) throw UserNotAuthenticatedErr();
	return user;
};
export async function voteAction(data: z.infer<typeof VoteValidator>) {
	const validatedData = VoteValidator.parse(data);

	if (!validatedData) throw ValidationErr("Invalid vote data");
	const user = await validateUser();

	const voteData = {
		postId: data.postId,
		type: data.type, // This can be "UP", "DOWN", or null
		userId: user.id,
	};
	console.log(voteData, "voteData");

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
}
