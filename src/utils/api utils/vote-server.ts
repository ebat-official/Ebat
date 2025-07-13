import { db } from "@/db";
import { sql } from "drizzle-orm";
import { VoteType } from "@/db/schema/enums";

export async function fetchVoteCounts(postId: string, userId?: string) {
	if (!postId) {
		throw new Error("Post ID is required to fetch vote counts.");
	}

	const result = await db.execute(sql`
		SELECT
			COUNT(*) FILTER (WHERE type = 'UP') AS upvotes,
			COUNT(*) FILTER (WHERE type = 'DOWN') AS downvotes,
		    MAX(CASE WHEN "user_id" = ${userId || null}::UUID THEN type ELSE NULL END) AS uservotetype
		FROM "vote"
		WHERE "post_id" = ${postId}
	`);

	const row = result[0] as {
		upvotes: string;
		downvotes: string;
		uservotetype: VoteType | null;
	};

	return {
		upVotes: Number(row.upvotes),
		downVotes: Number(row.downvotes),
		userVoteType: row.uservotetype,
	};
}
