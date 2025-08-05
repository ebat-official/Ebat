import { db } from "@/db";
import { karmaLogs, user } from "@/db/schema";
import { KarmaAction, PostType, VoteType } from "@/db/schema/enums";
import { eq, and, desc, count } from "drizzle-orm";
import { KarmaMetadata } from "@/types/karma";
import { updateUserKarmaPoints, validateUser } from "@/actions/user";
import { showKarmaNotification } from "@/components/shared/KarmaNotification";

// Karma calculation function
export function getKarmaAmount(
	action: KarmaAction,
	metadata: KarmaMetadata = {},
): number {
	switch (action) {
		case KarmaAction.POST_APPROVAL: {
			const postType = metadata.postType;
			switch (postType) {
				case PostType.QUESTION:
					return 5;
				case PostType.CHALLENGE:
					return 20;
				case PostType.SYSTEMDESIGN:
					return 20;
				case PostType.BLOGS:
					return 10;
				default:
					return 5;
			}
		}
		case KarmaAction.POST_EDIT_APPROVAL: {
			const postType = metadata.postType;
			switch (postType) {
				case PostType.QUESTION:
					return 3; // Half of 5, rounded up
				case PostType.CHALLENGE:
					return 10; // Half of 20
				case PostType.SYSTEMDESIGN:
					return 10; // Half of 20
				case PostType.BLOGS:
					return 5; // Half of 10
				default:
					return 3;
			}
		}
		case KarmaAction.POST_VOTE:
		case KarmaAction.COMMENT_VOTE: {
			const voteType = metadata.voteType;
			return voteType === VoteType.UP ? 1 : -1;
		}
		case KarmaAction.POST_VOTE_REMOVAL:
		case KarmaAction.COMMENT_VOTE_REMOVAL: {
			const voteType = metadata.voteType;
			return voteType === VoteType.UP ? -1 : 1; // Reverse the original vote
		}
		default:
			return 0;
	}
}

// Main karma award function
export async function awardKarma(
	userId: string,
	action: KarmaAction,
	karmaChange: number,
	metadata: KarmaMetadata = {},
): Promise<{ success: boolean; error?: string }> {
	try {
		// Get current user from session
		const currentUser = await validateUser();
		if (!currentUser) {
			return { success: false, error: "User not authenticated" };
		}

		// Calculate karma if not provided
		let finalKarmaChange = karmaChange;
		if (finalKarmaChange === 0) {
			finalKarmaChange = getKarmaAmount(action, metadata);
		}

		// Use database transaction for atomic operations
		await db.transaction(async (tx) => {
			// Get target user karma
			const targetUser = await tx.query.user.findFirst({
				where: eq(user.id, userId),
				columns: { karmaPoints: true },
			});

			if (!targetUser) {
				throw new Error("Target user not found");
			}

			// Calculate new karma
			const newKarma = targetUser.karmaPoints + finalKarmaChange;

			// Prevent negative karma
			if (newKarma < 0) {
				throw new Error("Insufficient karma for operation");
			}

			// Update user karma
			await tx
				.update(user)
				.set({ karmaPoints: newKarma })
				.where(eq(user.id, userId));

			// Log karma transaction
			await tx.insert(karmaLogs).values({
				userId: userId,
				fromUserId: currentUser.id,
				action: action,
				karmaChange: finalKarmaChange,
				postId: metadata.postId,
				commentId: metadata.commentId,
				metadata: metadata,
			});
		});

		// Show notification (will be implemented later)
		if (finalKarmaChange !== 0) {
			showKarmaNotification({
				action,
				karmaChange: finalKarmaChange,
				metadata,
			});
		}

		return { success: true };
	} catch (error) {
		console.error("Error awarding karma:", error);
		return { success: false, error: "Failed to award karma" };
	}
}

// Get user karma history
export async function getUserKarmaHistory(
	userId: string,
	limit = 20,
	offset = 0,
): Promise<{ karmaLogs: unknown[]; total: number }> {
	const [logs, totalResult] = await Promise.all([
		db.query.karmaLogs.findMany({
			where: eq(karmaLogs.userId, userId),
			orderBy: [desc(karmaLogs.createdAt)],
			limit,
			offset,
			with: {
				fromUser: {
					columns: {
						username: true,
						displayUsername: true,
					},
				},
			},
		}),
		db
			.select({ count: count() })
			.from(karmaLogs)
			.where(eq(karmaLogs.userId, userId)),
	]);

	return {
		karmaLogs: logs,
		total: Number(totalResult[0]?.count || 0),
	};
}
