import { getHtml } from "@/components/shared/Lexical Editor/utils/SSR/jsonToHTML";
import { db } from "@/db";
import { commentVotes, comments, users } from "@/db/schema";
import { VoteTypeType } from "@/db/schema/enums";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import type { SerializedEditorState, SerializedLexicalNode } from "lexical";
import { decompressContent } from "../compression";
import { COMMENT_SORT_OPTIONS } from "../contants";
import {
	AuthorData,
	CommentServerRawResult,
	CommentSortOption,
	CommentWithCountsResult,
	CommentWithVotes,
	PaginatedComments,
	ReplyCountResult,
} from "../types";

interface RawCommentResult {
	id: string;
	content: Buffer;
	created_at: Date;
	updated_at: Date;
	author_id: string;
	post_id: string;
	parent_id: string | null;
	total_count: number;
	upvotes: number;
	downvotes: number;
	userVoteType: VoteTypeType | null;
	reply_count: number;
	author_user_id?: string;
	author_user_name?: string;
	author_name?: string;
	author_image?: string;
	score: number;
}

const MAX_DEPTH = 3;

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
	try {
		depth = Math.min(depth, MAX_DEPTH);

		const baseQuery = sql`
			WITH comment_aggregates AS (
				SELECT 
					c.id,
					c.content,
					c.created_at,
					c.updated_at,
					c.author_id,
					c.post_id,
					c.parent_id,
					${
						includeVotes
							? sql`
						COALESCE(SUM(CASE WHEN cv.type = 'up' THEN 1 ELSE 0 END), 0) as upvotes,
						COALESCE(SUM(CASE WHEN cv.type = 'down' THEN 1 ELSE 0 END), 0) as downvotes,
						COALESCE(SUM(CASE WHEN cv.type = 'up' THEN 1 WHEN cv.type = 'down' THEN -1 ELSE 0 END), 0) as score
					`
							: sql`
						0 as upvotes,
						0 as downvotes,
						0 as score
					`
					}
				FROM comment c
				${includeVotes ? sql`LEFT JOIN "commentVote" cv ON cv.comment_id = c.id` : sql``}
				WHERE c.post_id = ${postId}
				GROUP BY c.id, c.content, c.created_at, c.updated_at, c.author_id, c.post_id, c.parent_id
			),
			reply_counts AS (
				SELECT 
					parent_id,
					COUNT(*) as reply_count
				FROM comment 
				WHERE post_id = ${postId} AND parent_id IS NOT NULL
				GROUP BY parent_id
			),
			user_votes AS (
				${
					userId && includeVotes
						? sql`
					SELECT 
						comment_id,
						type as vote_type
					FROM "commentVote"
					WHERE user_id = ${userId}::uuid
				`
						: sql`
					SELECT 
						NULL::uuid as comment_id,
						NULL::text as vote_type
					WHERE false
				`
				}
			),
			filtered_comments AS (
				SELECT 
					ca.*,
					COALESCE(rc.reply_count, 0) as reply_count,
					uv.vote_type as "userVoteType"
				FROM comment_aggregates ca
				LEFT JOIN reply_counts rc ON rc.parent_id = ca.id
				LEFT JOIN user_votes uv ON uv.comment_id = ca.id
				WHERE 
					${parentId ? sql`ca.parent_id = ${parentId}::uuid` : sql`ca.parent_id IS NULL`}
					${sort === COMMENT_SORT_OPTIONS.TOP && minScore > 0 ? sql`AND ca.score >= ${minScore}` : sql``}
			),
			paginated_comments AS (
				SELECT 
					*,
					COUNT(*) OVER() as total_count
				FROM filtered_comments
				ORDER BY 
					${
						sort === COMMENT_SORT_OPTIONS.TOP
							? sql`score DESC, created_at DESC`
							: sort === COMMENT_SORT_OPTIONS.NEWEST
								? sql`created_at DESC`
								: sql`created_at ASC`
					}
				LIMIT ${take}
				OFFSET ${skip}
			)
			SELECT 
				pc.*,
				${
					includeAuthor
						? sql`
					u.id as author_user_id,
					u.user_name as author_user_name,
					u.name as author_name,
					u.image as author_image
				`
						: sql`
					NULL as author_user_id,
					NULL as author_user_name,
					NULL as author_name,
					NULL as author_image
				`
				}
			FROM paginated_comments pc
			${includeAuthor ? sql`LEFT JOIN "user" u ON u.id = pc.author_id` : sql``}
			ORDER BY 
				${
					sort === COMMENT_SORT_OPTIONS.TOP
						? sql`pc.score DESC, pc.created_at DESC`
						: sort === COMMENT_SORT_OPTIONS.NEWEST
							? sql`pc.created_at DESC`
							: sql`pc.created_at ASC`
				}
		`;

		const result = await db.execute(baseQuery);
		const rows = result as unknown as CommentServerRawResult[];

		const processed: CommentWithVotes[] = await Promise.all(
			rows.map(async (row) => {
				let content: string | null = null;
				try {
					const decompressedContent = row.content
						? decompressContent(row.content)
						: null;

					content = decompressedContent
						? await getHtml(
								decompressedContent as unknown as SerializedEditorState<SerializedLexicalNode>,
							)
						: null;
				} catch {
					content = null;
				}

				const upVotes = Number(row.upvotes || 0);
				const downVotes = Number(row.downvotes || 0);
				const replyCount = Number(row.reply_count || 0);
				const totalVotes = upVotes + downVotes;

				return {
					id: row.id,
					content,
					createdAt: row.created_at,
					updatedAt: row.updated_at,
					authorId: row.author_id,
					postId: row.post_id,
					parentId: row.parent_id,
					author: includeAuthor
						? {
								id: row.author_user_id || row.author_id,
								userName: row.author_user_name || "Unknown",
								name: row.author_name || "Unknown",
								image: row.author_image || null,
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
					userVoteType: (row.userVoteType ?? null) as VoteTypeType | null,
					repliesExist: replyCount > 0,
					repliesLoaded: false,
					replies: [],
					repliesPagination: {
						hasMore: replyCount > replyTake,
						nextSkip: replyTake,
						totalCount: replyCount,
					},
				} as CommentWithVotes;
			}),
		);

		const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0;
		const totalPages = Math.ceil(totalCount / take);

		if (depth > 0) {
			const replyParents = processed
				.filter((c) => c.repliesExist)
				.map((c) => c.id);

			if (replyParents.length > 0) {
				const batchSize = 10;
				const batches = [];
				for (let i = 0; i < replyParents.length; i += batchSize) {
					batches.push(replyParents.slice(i, i + batchSize));
				}

				const replyResults = await Promise.all(
					batches.map(async (batch) => {
						const batchResults = await Promise.all(
							batch.map(async (parentId) =>
								getCommentsWithVotes(postId, parentId, userId, {
									sort,
									take: replyTake,
									skip: replySkip,
									depth: depth - 1,
									replyTake,
									currentPage: 1,
									minScore,
									includeAuthor,
									includeVotes,
								}),
							),
						);
						return batchResults.map((result, index) => ({
							parentId: batch[index],
							comments: result.comments,
						}));
					}),
				);

				const replyMap = new Map<string, CommentWithVotes[]>();
				for (const { parentId, comments } of replyResults.flat()) {
					replyMap.set(parentId, comments);
				}

				for (const comment of processed) {
					if (replyMap.has(comment.id)) {
						const replies = replyMap.get(comment.id)!;
						comment.replies = replies;
						comment.repliesLoaded = true;
						comment.repliesPagination = {
							hasMore: comment.repliesCount > replySkip + replyTake,
							nextSkip: replySkip + replyTake,
							totalCount: comment.repliesCount,
						};
					}
				}
			}
		}

		return {
			comments: processed,
			pagination: {
				hasMore: skip + take < totalCount,
				totalCount,
				currentPage,
				totalPages,
				nextSkip: skip + take < totalCount ? skip + take : undefined,
			},
		};
	} catch (error) {
		console.error("[getCommentsWithVotes] ERROR:", error);
		return {
			comments: [],
			pagination: {
				currentPage,
				totalPages: 0,
				totalCount: 0,
				hasMore: false,
				nextSkip: undefined,
			},
		};
	}
}

export async function getCommentsWithVotesAlternative(
	postId: string,
	parentId: string | null = null,
	userId: string | null = "",
	options: {
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
	const {
		sort = COMMENT_SORT_OPTIONS.TOP,
		take = 10,
		skip = 0,
		depth = 1,
		replyTake = 5,
		replySkip = 0,
		currentPage = 1,
		minScore = 0,
		includeAuthor = true,
		includeVotes = true,
	} = options;

	try {
		const clampedDepth = Math.min(depth, MAX_DEPTH);

		const voteAggregationQuery = sql`
			SELECT 
				c.id,
				c.content,
				c.created_at,
				c.updated_at,
				c.author_id,
				c.post_id,
				c.parent_id,
				${
					includeVotes
						? sql`
											COALESCE(SUM(CASE WHEN cv.type = 'up' THEN 1 ELSE 0 END), 0) as upvotes,
						COALESCE(SUM(CASE WHEN cv.type = 'down' THEN 1 ELSE 0 END), 0) as downvotes,
						COALESCE(SUM(CASE WHEN cv.type = 'up' THEN 1 WHEN cv.type = 'down' THEN -1 ELSE 0 END), 0) as score
				`
						: sql`
					0 as upvotes,
					0 as downvotes,
					0 as score
				`
				},
				${
					userId && includeVotes
						? sql`
					MAX(CASE WHEN uv.user_id = ${userId}::uuid THEN uv.type END) as user_vote_type
				`
						: sql`
					NULL as user_vote_type
				`
				}
			FROM ${comments} c
			${includeVotes ? sql`LEFT JOIN ${commentVotes} cv ON cv.comment_id = c.id` : sql``}
			${userId && includeVotes ? sql`LEFT JOIN ${commentVotes} uv ON uv.comment_id = c.id AND uv.user_id = ${userId}::uuid` : sql``}
			WHERE c.post_id = ${postId}
				AND ${parentId ? sql`c.parent_id = ${parentId}::uuid` : sql`c.parent_id IS NULL`}
			GROUP BY c.id, c.content, c.created_at, c.updated_at, c.author_id, c.post_id, c.parent_id
			${
				sort === COMMENT_SORT_OPTIONS.TOP && minScore > 0
					? sql`
				HAVING COALESCE(SUM(CASE WHEN cv.type = 'UP' THEN 1 WHEN cv.type = 'DOWN' THEN -1 ELSE 0 END), 0) >= ${minScore}
			`
					: sql``
			}
		`;

		const replyCountsQuery = sql`
			SELECT 
				parent_id,
				COUNT(*) as reply_count
			FROM ${comments}
			WHERE post_id = ${postId} AND parent_id IS NOT NULL
			GROUP BY parent_id
		`;

		const [commentsResult, replyCountsResult] = await Promise.all([
			db.execute(voteAggregationQuery),
			db.execute(replyCountsQuery),
		]);

		const replyCountsMap = new Map<string, number>();
		for (const row of replyCountsResult as unknown as ReplyCountResult[]) {
			replyCountsMap.set(row.parent_id, Number(row.reply_count));
		}

		const commentsWithCounts = (
			commentsResult as unknown as CommentWithCountsResult[]
		).map((row) => ({
			...row,
			reply_count: replyCountsMap.get(row.id) || 0,
			userVoteType: row.user_vote_type,
		}));

		const sortOrder =
			sort === COMMENT_SORT_OPTIONS.TOP
				? "score"
				: sort === COMMENT_SORT_OPTIONS.NEWEST
					? "created_at_desc"
					: "created_at_asc";

		commentsWithCounts.sort((a, b) => {
			switch (sortOrder) {
				case "score":
					return (
						b.score - a.score ||
						new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
					);
				case "created_at_desc":
					return (
						new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
					);
				case "created_at_asc":
					return (
						new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
					);
				default:
					return 0;
			}
		});

		const totalCount = commentsWithCounts.length;
		const paginatedComments = commentsWithCounts.slice(skip, skip + take);

		const authorData: Map<string, AuthorData> = new Map();
		if (includeAuthor && paginatedComments.length > 0) {
			const authorIds = [...new Set(paginatedComments.map((c) => c.author_id))];
			const authorQuery = db
				.select({
					id: users.id,
					userName: users.userName,
					name: users.name,
					image: users.image,
				})
				.from(users)
				.where(sql`${users.id} = ANY(${authorIds})`);

			const authorsResult = await authorQuery;
			for (const author of authorsResult) {
				authorData.set(author.id, author);
			}
		}

		const processed: CommentWithVotes[] = await Promise.all(
			paginatedComments.map(async (row) => {
				let content: string | null = null;
				try {
					const decompressedContent = row.content
						? decompressContent(row.content)
						: null;

					content = decompressedContent
						? await getHtml(
								decompressedContent as unknown as SerializedEditorState<SerializedLexicalNode>,
							)
						: null;
				} catch {
					content = null;
				}

				const upVotes = Number(row.upvotes || 0);
				const downVotes = Number(row.downvotes || 0);
				const replyCount = Number(row.reply_count || 0);
				const totalVotes = upVotes + downVotes;

				const author = authorData.get(row.author_id);
				const authorInfo = includeAuthor
					? {
							id: author?.id || row.author_id,
							userName: author?.userName || "Unknown",
							name: author?.name || "Unknown",
							image: author?.image || null,
						}
					: undefined;

				return {
					id: row.id,
					content,
					createdAt: row.created_at,
					updatedAt: row.updated_at,
					authorId: row.author_id,
					postId: row.post_id,
					parentId: row.parent_id,
					author: authorInfo,
					repliesCount: replyCount,
					votesCount: totalVotes,
					votesAggregate: {
						_count: { _all: totalVotes },
						_sum: { voteValue: upVotes - downVotes },
					},
					upVotes,
					downVotes,
					userVoteType: (row.userVoteType ?? null) as VoteTypeType | null,
					repliesExist: replyCount > 0,
					repliesLoaded: false,
					replies: [],
					repliesPagination: {
						hasMore: replyCount > replyTake,
						nextSkip: replyTake,
						totalCount: replyCount,
					},
				} as CommentWithVotes;
			}),
		);

		const totalPages = Math.ceil(totalCount / take);

		if (clampedDepth > 0) {
			const replyParents = processed
				.filter((c) => c.repliesExist)
				.map((c) => c.id);

			if (replyParents.length > 0) {
				const batchSize = 10;
				const batches = [];
				for (let i = 0; i < replyParents.length; i += batchSize) {
					batches.push(replyParents.slice(i, i + batchSize));
				}

				const replyResults = await Promise.all(
					batches.map(async (batch) => {
						const batchResults = await Promise.all(
							batch.map(async (parentId) =>
								getCommentsWithVotesAlternative(postId, parentId, userId, {
									sort,
									take: replyTake,
									skip: replySkip,
									depth: clampedDepth - 1,
									replyTake,
									currentPage: 1,
									minScore,
									includeAuthor,
									includeVotes,
								}),
							),
						);
						return batchResults.map((result, index) => ({
							parentId: batch[index],
							comments: result.comments,
						}));
					}),
				);

				const replyMap = new Map<string, CommentWithVotes[]>();
				for (const { parentId, comments } of replyResults.flat()) {
					replyMap.set(parentId, comments);
				}

				for (const comment of processed) {
					if (replyMap.has(comment.id)) {
						const replies = replyMap.get(comment.id)!;
						comment.replies = replies;
						comment.repliesLoaded = true;
						comment.repliesPagination = {
							hasMore: comment.repliesCount > replySkip + replyTake,
							nextSkip: replySkip + replyTake,
							totalCount: comment.repliesCount,
						};
					}
				}
			}
		}

		return {
			comments: processed,
			pagination: {
				hasMore: skip + take < totalCount,
				totalCount,
				currentPage,
				totalPages,
				nextSkip: skip + take < totalCount ? skip + take : undefined,
			},
		};
	} catch (error) {
		console.error("Error in getCommentsWithVotesAlternative:", error);
		return {
			comments: [],
			pagination: {
				currentPage,
				totalPages: 0,
				totalCount: 0,
				hasMore: false,
				nextSkip: undefined,
			},
		};
	}
}
