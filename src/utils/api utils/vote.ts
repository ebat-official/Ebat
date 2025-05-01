import prisma from "@/lib/prisma";

export async function fetchVoteCounts(postId: string, userId?: string) {
	if (!postId) {
		throw new Error("Post ID is required to fetch vote counts.");
	}

	const result = await prisma.$queryRawUnsafe<
		Array<{
			upvotes: number;
			downvotes: number;
			uservotetype: "UP" | "DOWN" | null;
		}>
	>(
		`
		SELECT
			COUNT(*) FILTER (WHERE type = 'UP') AS upvotes,
			COUNT(*) FILTER (WHERE type = 'DOWN') AS downvotes,
		    MAX(CASE WHEN "userId" = $2::UUID THEN type ELSE NULL END) AS uservotetype

		FROM "Vote"
		WHERE "postId" = $1
	`,
		postId,
		userId || null,
	);

	const { upvotes, downvotes, uservotetype } = result[0];

	return {
		upVotes: Number(upvotes),
		downVotes: Number(downvotes),
		userVoteType: uservotetype,
	};
}

export async function fetchVoteCountsFromAPI(postId: string) {
	if (!postId) {
		throw new Error("Post ID is required to fetch vote counts.");
	}
	const response = await fetch(`/api/post/votes/${postId}`);

	if (!response.ok) {
		let errorMessage = "Failed to fetch vote counts.";
		try {
			const errorData = await response.json();
			errorMessage = errorData.error || errorMessage;
		} catch {}
		throw new Error(errorMessage);
	}

	return response.json();
}
