"use server";
import { db } from "@/db";
import { follows } from "@/db/schema/follows";
import { SUCCESS } from "@/utils/constants";
import { UNAUTHENTICATED_ERROR, VALIDATION_ERROR } from "@/utils/errors";
import { GenerateActionReturnType } from "@/utils/types";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { validateUser } from "./user";
import { FollowAction } from "@/db/schema";
import {
	rateLimit,
	InteractionActions,
	RateLimitCategory,
} from "@/lib/rateLimit";

const FollowActionValidator = z.object({
	followedUserId: z.string(),
	action: z.nativeEnum(FollowAction),
});

export async function followAction(
	data: z.infer<typeof FollowActionValidator>,
): Promise<GenerateActionReturnType<string>> {
	// Rate limiting
	const rateLimitResult = await rateLimit(
		RateLimitCategory.INTERACTIONS,
		InteractionActions.FOLLOW,
	);
	if (!rateLimitResult.success) {
		return {
			status: "ERROR",
			data: { message: "Rate limit exceeded. Please try again later." },
		};
	}

	const validatedData = FollowActionValidator.safeParse(data);
	if (!validatedData.success) return VALIDATION_ERROR;
	const user = await validateUser();
	if (!user) return UNAUTHENTICATED_ERROR;
	const followerId = user.id;
	const followedId = validatedData.data.followedUserId;

	if (followerId === followedId) {
		return {
			status: "error",
			data: { message: "You cannot follow yourself." },
		};
	}

	if (validatedData.data.action === FollowAction.FOLLOW) {
		// Upsert follow
		await db
			.insert(follows)
			.values({ followerId, followedId })
			.onConflictDoNothing();
		return { status: SUCCESS, data: "Followed" };
	}
	// Unfollow
	await db
		.delete(follows)
		.where(
			and(
				eq(follows.followerId, followerId),
				eq(follows.followedId, followedId),
			),
		);
	return { status: SUCCESS, data: "Unfollowed" };
}

// Helper to check if current user is following another user
export async function isFollowing(followedUserId: string): Promise<boolean> {
	const user = await validateUser();
	if (!user) return false;
	const followerId = user.id;
	if (followerId === followedUserId) return false;
	const follow = await db.query.follows.findFirst({
		where: and(
			eq(follows.followerId, followerId),
			eq(follows.followedId, followedUserId),
		),
	});
	return !!follow;
}
