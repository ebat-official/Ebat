"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
	ValidationErr,
	UserNotAuthenticatedErr,
	FailedToSaveDraftErr,
	FailedToAddCommentErr,
} from "@/utils/errors";
import { z } from "zod";
import { CommentSortOption } from "@/utils/types";
import { Comment, VoteType } from "@prisma/client";
import { getCurrentUser } from "./user";
import { MentionData } from "@/components/shared/Lexical Editor/plugins/MentionPlugin/MentionChangePlugin";

// Validator for comment data
const MentionDataSchema = z.object({
	trigger: z.string(),
	value: z.string(),
	data: z
		.object({
			id: z.string().optional(),
			label: z.string().optional(),
		})
		.optional(),
});

const CommentValidator = z.object({
	id: z.string().optional(), // Optional for editing
	parentId: z.string().nullable().optional(), // Optional for top-level comments
	postId: z.string(), // Required to associate the comment with a post
	content: z.any(), // JSON content of the comment
	mentions: z.array(MentionDataSchema), // Can be an empty array or valid MentionData[]
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
		parentId: data.parentId || null,
		postId: data.postId,
		content: data.content,
		authorId: user.id,
	};

	try {
		const result = await prisma.$transaction(async (prisma) => {
			let comment: Comment;

			if (data.id) {
				// If id is provided, use upsert
				comment = await prisma.comment.upsert({
					where: { id: data.id },
					create: {
						...commentData,
						id: data.id, // preserve id during create
					},
					update: commentData,
				});
			} else {
				// Otherwise, just create
				comment = await prisma.comment.create({
					data: commentData,
				});
			}

			const mentions = data.mentions || [];

			if (mentions.length > 0) {
				await prisma.commentMention.createMany({
					data: mentions
						.map((mention) => mention?.data?.id)
						.filter((userId): userId is string => !!userId)
						.map((userId) => ({
							userId,
							commentId: comment.id,
						})),
					skipDuplicates: true,
				});
			}

			return comment;
		});

		return result;
	} catch (error) {
		console.error("Error creating comment with mentions:", error);
		const msg = error instanceof Error ? error.message : undefined;
		throw FailedToAddCommentErr(msg);
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
