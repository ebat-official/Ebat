import { Prisma, PrismaClient } from "@prisma/client";
import pako from "pako";
import {
	CommentSortOption,
	CommentWithVotes,
	PaginatedComments,
} from "../types";
import { COMMENT_SORT_OPTIONS } from "../contants";
import { getHtml } from "@/components/shared/Lexical Editor/utils/SSR/jsonToHTML";

const prisma = new PrismaClient();

export async function getCommentsWithVotes(
	postId: string,
	parentId: string | null = null,
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
	const baseQuery = Prisma.sql`
	  WITH paginated_comments AS (
		SELECT 
		  c.*,
		  COUNT(*) OVER() as total_count,
		  ${
				includeVotes
					? Prisma.sql`
			SUM(CASE WHEN cv.type = 'UP' THEN 1 ELSE 0 END) as likes,
			SUM(CASE WHEN cv.type = 'DOWN' THEN 1 ELSE 0 END) as dislikes,
		  `
					: Prisma.sql`
			0 as likes,
			0 as dislikes,
		  `
			}
		  (SELECT COUNT(*) FROM "Comment" r WHERE r."parentId" = c.id) as reply_count
		FROM "Comment" c
		${includeVotes ? Prisma.sql`LEFT JOIN "CommentVote" cv ON cv."commentId" = c.id` : Prisma.empty}
		WHERE c."postId" = ${postId}
		  ${
				parentId
					? Prisma.sql`AND c."parentId" = ${parentId}::uuid`
					: Prisma.sql`AND c."parentId" IS NULL`
			}
		  ${
				sort === COMMENT_SORT_OPTIONS.TOP
					? Prisma.sql`AND COALESCE((
			SELECT SUM(CASE WHEN v.type = 'UP' THEN 1 ELSE -1 END)
			FROM "CommentVote" v WHERE v."commentId" = c.id
		  ), 0) >= ${minScore}`
					: Prisma.empty
			}
		GROUP BY c.id
		ORDER BY 
		  ${
				sort === COMMENT_SORT_OPTIONS.TOP
					? Prisma.sql`(SUM(CASE WHEN cv.type = 'UP' THEN 1 ELSE 0 END) - SUM(CASE WHEN cv.type = 'DOWN' THEN 1 ELSE 0 END)) DESC`
					: sort === COMMENT_SORT_OPTIONS.NEWEST
						? Prisma.sql`c."createdAt" DESC`
						: Prisma.sql`c."createdAt" ASC`
			}
		LIMIT ${take}
		OFFSET ${skip}
	  )
	  SELECT 
		pc.*,
		${
			includeAuthor
				? Prisma.sql`
		json_build_object(
		  'id', a.id,
		  'userName', a."userName",
		  'name', up.name,
		  'image', up.image
		) as author
	  `
				: Prisma.sql`NULL as author`
		}
	  FROM paginated_comments pc
	  ${includeAuthor ? Prisma.sql`JOIN "User" a ON a.id = pc."authorId"` : Prisma.empty}
	  ${includeAuthor ? Prisma.sql`LEFT JOIN "UserProfile" up ON up."userId" = a.id` : Prisma.empty}
	`;

	interface RawCommentResult {
		id: string;
		content: Buffer;
		createdAt: Date;
		authorId: string;
		postId: string;
		parentId: string | null;
		total_count: number;
		likes: number;
		dislikes: number;
		reply_count: number;
		author?: {
			id: string;
			userName: string | null;
			name: string | null;
			image?: string | null;
		};
	}

	const result = await prisma.$queryRaw<RawCommentResult[]>(baseQuery);

	const processed: CommentWithVotes[] = await Promise.all(
		result.map(async (row) => {
			let content: string | null = null;
			try {
				// Decompress the content
				const decompressedContent = row.content
					? JSON.parse(pako.inflate(row.content, { to: "string" }))
					: null;

				// Convert the decompressed content to HTML
				content = decompressedContent
					? await getHtml(decompressedContent)
					: null;
			} catch {
				content = null;
			}

			const likes = Number(row.likes);
			const dislikes = Number(row.dislikes);
			const replyCount = Number(row.reply_count);
			const totalVotes = likes + dislikes;

			return {
				id: row.id,
				content,
				createdAt: row.createdAt,
				authorId: row.authorId,
				postId: row.postId,
				parentId: row.parentId,
				author: includeAuthor
					? {
							id: row.author?.id || row.authorId,
							userName: row.author?.userName || "Unknown",
							name: row.author?.name || "Unknown",
							image: row.author?.image || null,
						}
					: undefined,
				_count: {
					replies: replyCount,
					votes: totalVotes,
				},
				votesAggregate: {
					_count: { _all: totalVotes },
					_sum: { voteValue: likes - dislikes },
				},
				likes,
				dislikes,
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

	const totalCount = result.length > 0 ? Number(result[0].total_count) : 0;
	const totalPages = Math.ceil(totalCount / take);

	if (depth > 0) {
		const replyParents = processed
			.filter((c) => c.repliesExist)
			.map((c) => c.id);
		if (replyParents.length > 0) {
			const replyResults = await Promise.all(
				replyParents.map(async (parentId) =>
					getCommentsWithVotes(postId, parentId, {
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

			const replyMap = new Map<string, CommentWithVotes[]>();
			replyResults.forEach((res, i) => {
				replyMap.set(replyParents[i], res.comments);
			});

			// biome-ignore lint/complexity/noForEach: <explanation>
			processed.forEach((comment) => {
				if (replyMap.has(comment.id)) {
					const replies = replyMap.get(comment.id)!;
					comment.replies = replies;
					comment.repliesLoaded = true;
					comment.repliesPagination = {
						hasMore: comment._count.replies > replySkip + replyTake,
						nextSkip: replySkip + replyTake,
						totalCount: comment._count.replies,
					};
				}
			});
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
}

// lib/api/comments.ts

export async function fetchComments(
	postId: string,
	options: {
		page?: number;
		take?: number;
		depth?: number;
		sort?: CommentSortOption;
	} = {},
): Promise<PaginatedComments> {
	if (!postId) {
		throw new Error("Post ID is required to fetch comments.");
	}

	const query = new URLSearchParams({
		...(options.page && { page: options.page.toString() }),
		...(options.take && { take: options.take.toString() }),
		...(options.depth && { depth: options.depth.toString() }),
		...(options.sort && { sort: options.sort }),
	});

	const response = await fetch(`/api/comments/${postId}?${query.toString()}`);

	if (!response.ok) {
		let errorMessage = "Failed to fetch comments.";
		try {
			const errorData = await response.json();
			errorMessage = errorData.error || errorMessage;
		} catch {
			// Fallback to generic error
		}
		throw new Error(errorMessage);
	}

	return response.json();
}
