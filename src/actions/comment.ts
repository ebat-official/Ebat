"use server";
import { db } from "@/db";
import { comments, commentMentions, commentVotes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { UNAUTHENTICATED_ERROR, VALIDATION_ERROR } from "@/utils/errors";
import { z } from "zod";
import { CommentWithVotes, GenerateActionReturnType } from "@/utils/types";
import { Comment } from "@/db/schema/zod-schemas";
import { VoteType } from "@/db/schema/enums";
import { validateUser } from "./user";
import { compressContent, decompressContent } from "@/utils/compression";
import { invalidateCommentsCache } from "@/lib/invalidateCache";
import { getHtml } from "@/components/shared/Lexical Editor/utils/SSR/jsonToHTML";
import { commentNodes } from "@/components/shared/Lexical Editor/utils/SSR/nodes";
import { ERROR, SUCCESS } from "@/utils/contants";
import { SerializedEditorState } from "lexical";

// Type for comment with relations
type CommentWithRelations = Comment & {
	author: {
		id: string;
		userName: string | null;
		profile: {
			name: string | null;
			image: string | null;
		} | null;
	} | null;
	votes: Array<{ type: VoteType }>;
	repliesCount: number;
	votesCount: number;
	userVoteType?: VoteType | null;
};

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

const checkCommentOwnership = async (
	commentId: string,
	userId: string,
): Promise<boolean> => {
	const existingComment = await db.query.comments.findFirst({
		where: eq(comments.id, commentId),
		columns: { authorId: true },
	});

	if (!existingComment) {
		throw new Error("Comment not found.");
	}

	return existingComment.authorId === userId;
};

async function formatCommentWithVotes(
	comment: CommentWithRelations,
): Promise<CommentWithVotes> {
	// Decompress content from binary storage
	const decompressedContent = comment.content
		? decompressContent(comment.content)
		: null;

	return {
		id: comment.id,
		content: decompressedContent
			? await getHtml(
					decompressedContent as unknown as SerializedEditorState,
					commentNodes,
				)
			: "",
		createdAt: comment.createdAt,
		updatedAt: comment.updatedAt,
		authorId: comment.authorId,
		postId: comment.postId,
		parentId: comment.parentId,
		author: comment.author
			? {
					id: comment.author.id,
					userName: comment.author.userName || "",
					name: comment.author.profile?.name || undefined,
					image: comment.author.profile?.image || null,
				}
			: undefined,
		repliesCount: comment.repliesCount,
		votesCount: comment.votesCount,
		votesAggregate: {
			_count: { _all: comment.votes.length },
			_sum: {
				voteValue: comment.votes.reduce(
					(sum, vote) => sum + (vote.type === VoteType.UP ? 1 : -1),
					0,
				),
			},
		},
		upVotes: comment.votes.filter((vote) => vote.type === VoteType.UP).length,
		downVotes: comment.votes.filter((vote) => vote.type === VoteType.DOWN)
			.length,
		userVoteType: comment.userVoteType || null,
		repliesExist: comment.repliesCount > 0,
		repliesLoaded: false,
		replies: [],
		repliesPagination: {
			hasMore: false,
			nextSkip: 0,
			totalCount: comment.repliesCount,
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
		content: compressContent(data.content), // Compress content to Buffer
		authorId: user.id,
		updatedAt: new Date(),
	};

	if (data.id) {
		const isOwner = await checkCommentOwnership(data.id, user.id);
		if (!isOwner) {
			return UNAUTHENTICATED_ERROR;
		}
	}

	const result = await db.transaction(async (tx) => {
		let comment: Awaited<
			ReturnType<typeof tx.query.comments.findFirst>
		> | null = null;

		if (data.id) {
			// Update existing comment
			const updatedComments = await tx
				.update(comments)
				.set({ content: commentData.content })
				.where(eq(comments.id, data.id))
				.returning();

			// Get comment with relations
			comment = await tx.query.comments.findFirst({
				where: eq(comments.id, data.id),
				with: {
					author: {
						columns: {
							id: true,
							userName: true,
						},
						with: {
							profile: {
								columns: {
									name: true,
									image: true,
								},
							},
						},
					},
					votes: {
						columns: {
							type: true,
						},
					},
				},
			});
		} else {
			// Create new comment
			const newComments = await tx
				.insert(comments)
				.values(commentData)
				.returning();

			// Get comment with relations
			comment = await tx.query.comments.findFirst({
				where: eq(comments.id, newComments[0].id),
				with: {
					author: {
						columns: {
							id: true,
							userName: true,
						},
						with: {
							profile: {
								columns: {
									name: true,
									image: true,
								},
							},
						},
					},
					votes: {
						columns: {
							type: true,
						},
					},
				},
			});
		}

		if (!comment) {
			throw new Error("Failed to create/update comment");
		}

		// Add counts manually (since Drizzle doesn't support _count like Prisma)
		const replyCount = await tx.query.comments.findMany({
			where: eq(comments.parentId, comment.id),
		});

		const voteCount = await tx.query.commentVotes.findMany({
			where: eq(commentVotes.commentId, comment.id),
		});

		const commentWithCounts = {
			...comment,
			repliesCount: replyCount.length,
			votesCount: voteCount.length,
		} as CommentWithRelations;

		// Handle mentions
		const mentions = data.mentions || [];
		if (mentions.length > 0) {
			const mentionData = mentions
				.map((mention) => mention?.data?.id)
				.filter((userId): userId is string => !!userId)
				.map((userId) => ({
					userId,
					commentId: comment.id,
				}));

			if (mentionData.length > 0) {
				await tx
					.insert(commentMentions)
					.values(mentionData)
					.onConflictDoNothing();
			}
		}

		invalidateCommentsCache(data.postId);
		return formatCommentWithVotes(commentWithCounts);
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
	const existingComment = await db.query.comments.findFirst({
		where: eq(comments.id, commentId),
		columns: { authorId: true },
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

	// Delete the comment (children will be deleted automatically due to cascade)
	await db.delete(comments).where(eq(comments.id, commentId));

	invalidateCommentsCache(postId);

	// Return success response
	return {
		status: SUCCESS,
		data: SUCCESS,
	};
}
