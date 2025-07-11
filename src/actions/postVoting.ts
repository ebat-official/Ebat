"use server";
import { UNAUTHENTICATED_ERROR, ValidationErr } from "@/utils/errors";
import { z } from "zod";
import { getCurrentUser, validateUser } from "./user";
import { VoteType } from "@/db/schema/enums";
import { db } from "@/db";
import { votes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { GenerateActionReturnType } from "@/utils/types";
import { SUCCESS } from "@/utils/contants";

const VoteValidator = z.object({
	postId: z.string(),
	type: z.nativeEnum(VoteType).nullable(),
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
		await db
			.delete(votes)
			.where(
				and(
					eq(votes.userId, voteData.userId),
					eq(votes.postId, voteData.postId),
				),
			);
	} else {
		// Upsert the vote if type is "UP" or "DOWN"
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
	}
	return { status: SUCCESS, data: SUCCESS };
}
