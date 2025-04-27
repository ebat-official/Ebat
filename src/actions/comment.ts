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
import { CommentSortOption, CommentWithVotes } from "@/utils/types";
import { Comment, Prisma, VoteType } from "@prisma/client";
import { getCurrentUser } from "./user";
import { MentionData } from "@/components/shared/Lexical Editor/plugins/MentionPlugin/MentionChangePlugin";
import pako from "pako";
import { invalidateCommentsCache } from "@/lib/invalidateCache";
import { getHtml } from "@/components/shared/Lexical Editor/utils/SSR/jsonToHTML";

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

// Shared utility functions

const validateUser = async () => {
	const user = await getCurrentUser();
	if (!user) throw UserNotAuthenticatedErr();
	return user;
};

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

async function formatCommentWithVotes(
	comment: CommentIncludeType,
): Promise<CommentWithVotes> {
	return {
		id: comment.id,
		// @ts-ignore
		content: await getHtml(comment.content),
		createdAt: comment.createdAt,
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
		likes: comment.votes.filter((vote) => vote.type === "UP").length,
		dislikes: comment.votes.filter((vote) => vote.type === "DOWN").length,
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
): Promise<CommentWithVotes> {
	// Validate the input data
	const validation = CommentValidator.safeParse(data);
	if (!validation.success) throw ValidationErr("Invalid comment data.");

	const user = await validateUser();

	const commentData = {
		parentId: data.parentId || null,
		postId: data.postId,
		content: pako.deflate(JSON.stringify(data.content)), // Compress content
		authorId: user.id,
	};

	try {
		const result = await prisma.$transaction(async (prisma) => {
			// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
			let comment;

			if (data.id) {
				// If id is provided, use update
				comment = await prisma.comment.update({
					where: { id: data.id },
					data: commentData,
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

		return result;
	} catch (error) {
		console.error("Error creating comment with mentions:", error);
		const msg = error instanceof Error ? error.message : undefined;
		throw FailedToAddCommentErr(msg);
	}
}
