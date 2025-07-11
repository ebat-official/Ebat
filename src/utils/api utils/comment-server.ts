import { comments, commentVotes, users, userProfiles } from "@/db/schema";
import { VoteTypeType } from "@/db/schema/enums";
import { db } from "@/db";
import { eq, and, isNull, sql, desc, asc } from "drizzle-orm";
import {
	CommentSortOption,
	CommentWithVotes,
	PaginatedComments,
} from "../types";
import { COMMENT_SORT_OPTIONS } from "../contants";
import { getHtml } from "@/components/shared/Lexical Editor/utils/SSR/jsonToHTML";
import { decompressContent } from "../compression";
import { SerializedEditorState } from "lexical";

export async function getCommentsWithVotes(
	postId: string,
	parentId: string | null = null,
	userId: string | null = "",
	{
		sort = COMMENT_SORT_OPTIONS.TOP as CommentSortOption,
		take = 10,
		skip = 0,
		depth = 1,
		replyTake = 5,
		replySkip = 0,
		currentPage = 1,
		minScore = 0,
		includeAuthor = true,
		includeVotes = true,
	}: {
		sort?: CommentSortOption;
		take?: number;
		skip?: number;
		depth?: number;
		replyTake?: number;
		replySkip?: number;
		currentPage?: number;
		minScore?: number;
		includeAuthor?: boolean;
		includeVotes?: boolean;
	} = {},
): Promise<PaginatedComments> {
	// Get comments with basic info
	const baseComments = await db
		.select({
			id: comments.id,
			content: comments.content,
			createdAt: comments.createdAt,
			updatedAt: comments.updatedAt,
			authorId: comments.authorId,
			postId: comments.postId,
			parentId: comments.parentId,
		})
		.from(comments)
		.where(
			and(
				eq(comments.postId, postId),
				parentId ? eq(comments.parentId, parentId) : isNull(comments.parentId),
			),
		)
		.orderBy(
			sort === COMMENT_SORT_OPTIONS.NEWEST
				? desc(comments.createdAt)
				: asc(comments.createdAt),
		)
		.limit(take)
		.offset(skip);

	// Get total count
	const totalCountResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(comments)
		.where(
			and(
				eq(comments.postId, postId),
				parentId ? eq(comments.parentId, parentId) : isNull(comments.parentId),
			),
		);

	const totalCount = totalCountResult[0]?.count || 0;

	// Get vote counts and user votes for each comment
	const commentIds = baseComments.map((c) => c.id);
	const voteCounts =
		includeVotes && commentIds.length > 0
			? await db
					.select({
						commentId: commentVotes.commentId,
						upvotes: sql<number>`SUM(CASE WHEN ${commentVotes.type} = 'UP' THEN 1 ELSE 0 END)`,
						downvotes: sql<number>`SUM(CASE WHEN ${commentVotes.type} = 'DOWN' THEN 1 ELSE 0 END)`,
					})
					.from(commentVotes)
					.where(sql`${commentVotes.commentId} = ANY(${commentIds})`)
					.groupBy(commentVotes.commentId)
			: [];

	// Get user votes if userId provided
	const userVotes =
		userId && commentIds.length > 0
			? await db
					.select({
						commentId: commentVotes.commentId,
						type: commentVotes.type,
					})
					.from(commentVotes)
					.where(
						and(
							sql`${commentVotes.commentId} = ANY(${commentIds})`,
							eq(commentVotes.userId, userId),
						),
					)
			: [];

	// Get reply counts
	const replyCounts =
		commentIds.length > 0
			? await db
					.select({
						parentId: comments.parentId,
						count: sql<number>`count(*)`,
					})
					.from(comments)
					.where(sql`${comments.parentId} = ANY(${commentIds})`)
					.groupBy(comments.parentId)
			: [];

	// Get author info if needed
	const authors =
		includeAuthor && commentIds.length > 0
			? await db
					.select({
						id: users.id,
						userName: users.userName,
						name: userProfiles.name,
						image: userProfiles.image,
					})
					.from(users)
					.leftJoin(userProfiles, eq(userProfiles.userId, users.id))
					.where(sql`${users.id} = ANY(${baseComments.map((c) => c.authorId)})`)
			: [];

	// Create lookup maps
	const voteMap = new Map(voteCounts.map((v) => [v.commentId, v]));
	const userVoteMap = new Map(userVotes.map((v) => [v.commentId, v.type]));
	const replyCountMap = new Map(
		replyCounts.map((r) => [r.parentId!, Number(r.count)]),
	);
	const authorMap = new Map(authors.map((a) => [a.id, a]));

	const processed: CommentWithVotes[] = await Promise.all(
		baseComments.map(async (comment) => {
			let content: string | null = null;
			try {
				// Decompress the content using utility
				const decompressedContent = comment.content
					? decompressContent(comment.content)
					: null;

				// Convert the decompressed content to HTML
				content = decompressedContent
					? await getHtml(
							decompressedContent as unknown as SerializedEditorState,
						)
					: null;
			} catch {
				content = null;
			}

			const votes = voteMap.get(comment.id);
			const upVotes = Number(votes?.upvotes || 0);
			const downVotes = Number(votes?.downvotes || 0);
			const replyCount = replyCountMap.get(comment.id) || 0;
			const totalVotes = upVotes + downVotes;
			const author = authorMap.get(comment.authorId);

			return {
				id: comment.id,
				content,
				createdAt: comment.createdAt,
				updatedAt: comment.updatedAt,
				authorId: comment.authorId,
				postId: comment.postId,
				parentId: comment.parentId,
				author:
					includeAuthor && author
						? {
								id: author.id,
								userName: author.userName || "Unknown",
								name: author.name || "Unknown",
								image: author.image || null,
							}
						: undefined,
				repliesCount: replyCount,
				votesCount: totalVotes,
				votesAggregate: {
					_count: { _all: totalVotes },
					_sum: { voteValue: upVotes - downVotes },
				},
				upVotes,
				downVotes,
				userVoteType: (userVoteMap.get(comment.id) ??
					null) as VoteTypeType | null,
				repliesExist: replyCount > 0,
				repliesLoaded: false,
				replies: [],
				repliesPagination: {
					hasMore: replyCount > replyTake,
					nextSkip: replyTake,
					totalCount: replyCount,
				},
			};
		}),
	);

	// Sort by votes if needed (after processing to have vote counts)
	if (sort === COMMENT_SORT_OPTIONS.TOP) {
		processed.sort((a, b) => {
			const aScore = a.upVotes - a.downVotes;
			const bScore = b.upVotes - b.downVotes;
			return bScore - aScore;
		});
	}

	const totalPages = Math.ceil(totalCount / take);

	if (depth > 0) {
		const replyParents = processed
			.filter((c) => c.repliesExist)
			.map((c) => c.id);
		if (replyParents.length > 0) {
			const replyResults = await Promise.all(
				replyParents.map(async (parentId) =>
					getCommentsWithVotes(postId, parentId, userId, {
						sort,
						take: replyTake,
						skip: replySkip,
						depth: depth - 1,
						includeAuthor,
						includeVotes,
					}),
				),
			);

			// Merge replies back into parent comments
			replyResults.forEach((replyResult, index) => {
				const parentComment = processed.find(
					(c) => c.id === replyParents[index],
				);
				if (parentComment && replyResult.pagination) {
					parentComment.replies = replyResult.comments;
					parentComment.repliesLoaded = true;
					parentComment.repliesPagination = {
						hasMore: replyResult.pagination.hasMore,
						nextSkip: replyResult.pagination.nextSkip || 0,
						totalCount: replyResult.pagination.totalCount,
					};
				}
			});
		}
	}

	return {
		comments: processed,
		pagination: {
			currentPage,
			totalPages,
			totalCount,
			hasMore: currentPage < totalPages,
			nextSkip: currentPage < totalPages ? skip + take : undefined,
		},
	};
}
