import prisma from "@/lib/prisma";
import { CommentSortOption } from "@/utils/types";
import { VoteType } from "@prisma/client";

async function getComments(
	postId: string,
	parentId: string | null = null,
	sortOption: CommentSortOption = "TOP",
	take = 10,
	skip = 0,
) {
	// Base query configuration
	const baseQuery = {
		where: {
			postId,
			parentId,
		},
		include: {
			author: true,
			_count: {
				select: {
					replies: true,
					votes: {
						where: { type: VoteType.UP },
					},
				},
			},
		},
		take,
		skip,
	};

	// Apply different sorting based on the option
	switch (sortOption) {
		case "TOP":
			return await prisma.comment.findMany({
				...baseQuery,
				orderBy: {
					votes: {
						_count: "desc",
					},
				},
			});

		case "NEWEST":
			return await prisma.comment.findMany({
				...baseQuery,
				orderBy: {
					createdAt: "desc",
				},
			});

		case "OLDEST":
			return await prisma.comment.findMany({
				...baseQuery,
				orderBy: {
					createdAt: "asc",
				},
			});

		case "CONTROVERSIAL": {
			// This requires fetching all votes to calculate ratio
			const comments = await prisma.comment.findMany({
				...baseQuery,
				include: {
					...baseQuery.include,
					votes: true,
				},
			});

			return comments
				.map((comment) => {
					const upvotes = comment.votes.filter(
						(v) => v.type === VoteType.UP,
					).length;
					const downvotes = comment.votes.filter(
						(v) => v.type === VoteType.DOWN,
					).length;
					return {
						...comment,
						controversyScore: Math.min(upvotes, downvotes), // Simple controversy metric
					};
				})
				.sort((a, b) => b.controversyScore - a.controversyScore);
		}

		default:
			return await prisma.comment.findMany({
				...baseQuery,
				orderBy: {
					votes: {
						_count: "desc",
					},
				},
			});
	}
}
