import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
	ValidationErr,
	UserNotAuthenticatedErr,
	FailedToSaveDraftErr,
} from "@/utils/errors";
import { z } from "zod";
import { CommentSortOption } from "@/utils/types";
import { VoteType } from "@prisma/client";
import { getCurrentUser } from "./user";

// Validator for comment data
const CommentValidator = z.object({
	id: z.string().optional(), // Optional for editing
	parentId: z.string().nullable().optional(), // Optional for top-level comments
	postId: z.string(), // Required to associate the comment with a post
	content: z.any(), // JSON content of the comment
});

// Shared utility functions

const validateUser = async () => {
	const user = await getCurrentUser();
	if (!user) throw UserNotAuthenticatedErr();
	return user;
};

// Create or edit a comment
export async function createComment(data: z.infer<typeof CommentValidator>) {
	// Validate the input data
	const validation = CommentValidator.safeParse(data);
	if (!validation.success) throw ValidationErr("Invalid comment data.");

	const user = await validateUser();

	const commentData = {
		id: data.id, // If `id` exists, it will be used for editing
		parentId: data.parentId || null, // If `parentId` is not provided, set it to null
		postId: data.postId,
		text: data.content, //
		authorId: user.id,
	};

	try {
		const comment = await prisma.comment.upsert({
			where: { id: data.id || undefined }, // If `id` exists, it will update the comment
			create: commentData, // Create a new comment
			update: commentData, // Update the existing comment
		});

		return comment; // Return the ID of the created or updated comment
	} catch (error) {
		throw FailedToSaveDraftErr("Failed to save the comment.");
	}
}

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
