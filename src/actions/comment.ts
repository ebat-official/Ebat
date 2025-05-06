"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { UNAUTHENTICATED_ERROR, VALIDATION_ERROR } from "@/utils/errors";
import { z } from "zod";
import {
	CommentSortOption,
	CommentWithVotes,
	ErrorType,
	GenerateActionReturnType,
	SuccessType,
} from "@/utils/types";
import { Comment, Prisma, VoteType } from "@prisma/client";
import { getCurrentUser, validateUser } from "./user";
import { MentionData } from "@/components/shared/Lexical Editor/plugins/MentionPlugin/MentionChangePlugin";
import pako from "pako";
import { invalidateCommentsCache } from "@/lib/invalidateCache";
import { getHtml } from "@/components/shared/Lexical Editor/utils/SSR/jsonToHTML";
import { commentNodes } from "@/components/shared/Lexical Editor/utils/SSR/nodes";
import { ERROR, SUCCESS } from "@/utils/contants";

type CommentIncludeType = Prisma.CommentGetPayload<{
	include: typeof commentInclude;
}>;
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

// Include object for comment queries
const commentInclude = {
	author: {
		select: {
			id: true,
			userName: true,
			userProfile: {
				select: {
					name: true,
					image: true,
				},
			},
		},
	},
	_count: {
		select: {
			replies: true,
			votes: true,
		},
	},
	votes: {
		select: {
			type: true,
		},
	},
};

const checkCommentOwnership = async (
	commentId: string,
	userId: string,
): Promise<boolean> => {
	const existingComment = await prisma.comment.findUnique({
		where: { id: commentId },
		select: { authorId: true },
	});

	if (!existingComment) {
		throw new Error("Comment not found.");
	}

	return existingComment.authorId === userId;
};

async function formatCommentWithVotes(
	comment: CommentIncludeType & { userVoteType?: VoteType | null },
): Promise<CommentWithVotes> {
	return {
		id: comment.id,
		// @ts-ignore
		content: await getHtml(comment.content, commentNodes),
		createdAt: comment.createdAt,
		updatedAt: comment.updatedAt,
		authorId: comment.authorId,
		postId: comment.postId,
		parentId: comment.parentId,
		author: comment.author
			? {
					id: comment.author.id,
					userName: comment.author.userName || "",
					name: comment.author.userProfile?.name || undefined,
					image: comment.author.userProfile?.image || null,
				}
			: undefined,
		_count: {
			replies: comment._count.replies,
			votes: comment._count.votes,
		},
		votesAggregate: {
			_count: { _all: comment.votes.length },
			_sum: {
				voteValue: comment.votes.reduce(
					(sum, vote) => sum + (vote.type === "UP" ? 1 : -1),
					0,
				),
			},
		},
		upVotes: comment.votes.filter((vote) => vote.type === "UP").length,
		downVotes: comment.votes.filter((vote) => vote.type === "DOWN").length,
		userVoteType: comment.userVoteType || null,
		repliesExist: comment._count.replies > 0,
		repliesLoaded: false,
		replies: [],
		repliesPagination: {
			hasMore: false,
			nextSkip: 0,
			totalCount: comment._count.replies,
		},
	};
}

// Create or edit a comment
export async function createEditComment(
	data: z.infer<typeof CommentValidator>,
): Promise<GenerateActionReturnType<CommentWithVotes>> {
	// Validate the input data
	const validation = CommentValidator.safeParse(data);
	if (!validation.success) return VALIDATION_ERROR;

	const user = await validateUser();

	if (!user) return UNAUTHENTICATED_ERROR;

	const commentData = {
		parentId: data.parentId || null,
		postId: data.postId,
		content: pako.deflate(JSON.stringify(data.content)), // Compress content
		authorId: user.id,
		updatedAt: new Date(),
	};

	if (data.id) {
		const isOwner = await checkCommentOwnership(data.id, user.id);
		if (!isOwner) {
			return UNAUTHENTICATED_ERROR;
		}
	}
	const result = await prisma.$transaction(async (prisma) => {
		// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
		let comment;

		if (data.id) {
			// Check ownership before updating the comment
			// If id is provided, use update
			comment = await prisma.comment.update({
				where: { id: data.id },
				data: {
					content: commentData.content,
				},
				include: commentInclude, // Reuse the include object
			});
		} else {
			// Otherwise, create
			comment = await prisma.comment.create({
				data: commentData,
				include: commentInclude, // Reuse the include object
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
		invalidateCommentsCache(data.postId);
		comment.content = data.content;
		return formatCommentWithVotes(comment);
	});

	return { status: SUCCESS, data: result };
}

export async function deleteComment(
	commentId: string,
	postId: string,
): Promise<GenerateActionReturnType<string>> {
	// Validate the user
	const user = await validateUser();

	if (!user) return UNAUTHENTICATED_ERROR;

	// Check if the comment exists and belongs to the user
	const existingComment = await prisma.comment.findUnique({
		where: { id: commentId },
		select: { authorId: true },
	});

	if (!existingComment) {
		return {
			status: ERROR,
			data: { message: "Comment not found." },
		};
	}

	if (existingComment.authorId !== user.id) {
		return {
			status: ERROR,
			data: { message: "You are not authorized to delete this comment." },
		};
	}

	// Delete the comment (children will be deleted automatically due to `onDelete: Cascade`)
	await prisma.comment.delete({
		where: { id: commentId },
	});
	invalidateCommentsCache(postId);
	// Return success response
	return {
		status: SUCCESS,
		data: SUCCESS,
	};
}
