import { db } from "@/db";
import { votes } from "@/db/schema";
import { VoteType } from "@/db/schema/enums";
import { and, count, eq, sql, sum } from "drizzle-orm";

export async function fetchVoteCounts(postId: string, userId?: string) {
	if (!postId) {
		throw new Error("Post ID is required to fetch vote counts.");
	}

	try {
		// Get vote counts using proper aggregation
		const voteCountsQuery = db
			.select({
				upVotes: sum(sql`CASE WHEN ${votes.type} = 'UP' THEN 1 ELSE 0 END`).as(
					"upVotes",
				),
				downVotes: sum(
					sql`CASE WHEN ${votes.type} = 'DOWN' THEN 1 ELSE 0 END`,
				).as("downVotes"),
			})
			.from(votes)
			.where(eq(votes.postId, postId));

		// Get user vote if userId provided
		const userVoteQuery = userId
			? db
					.select({ type: votes.type })
					.from(votes)
					.where(and(eq(votes.postId, postId), eq(votes.userId, userId)))
					.limit(1)
			: Promise.resolve([]);

		const [voteCountsResult, userVoteResult] = await Promise.all([
			voteCountsQuery,
			userVoteQuery,
		]);

		const voteCounts = voteCountsResult[0];
		const userVote = userVoteResult[0];

		return {
			upVotes: Number(voteCounts?.upVotes || 0),
			downVotes: Number(voteCounts?.downVotes || 0),
			userVoteType: userVote?.type || null,
		};
	} catch (error) {
		console.error("Error fetching vote counts:", error);
		throw new Error("Failed to fetch vote counts");
	}
}
