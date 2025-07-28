import { validateUser } from "@/actions/user";
import { auth } from "@/auth";
import { extractTOCAndEnhanceHTML } from "@/components/shared/Lexical Editor/utils/SSR/extractTOCAndEnhanceHTML";
import { getHtml } from "@/components/shared/Lexical Editor/utils/SSR/jsonToHTML";
import { POST_ID_LENGTH } from "@/config";
import { db } from "@/db";
import {
	challengeTemplates,
	completionStatuses,
	postEdits,
	postViews,
	posts,
} from "@/db/schema";
import {
	Difficulty,
	PostApprovalStatus,
	PostCategory,
	PostStatus,
	PostType,
	SubCategory,
} from "@/db/schema/enums";
import {
	and,
	asc,
	count,
	desc,
	eq,
	ilike,
	inArray,
	or,
	sql,
} from "drizzle-orm";
import { decompressContent } from "../compression";
import { EndpointMap, INVALID_PAGE, INVALID_PAGE_SIZE } from "../constants";
import { UNAUTHORIZED_ERROR } from "../errors";
import { sanitizeSearchQuery } from "../sanitizeSearchQuery";
import { PostSearchResponse, PostSortOrder } from "../types";
import {
	ChallengeTemplate,
	ContentReturnType,
	ContentType,
	PostWithExtraDetails,
	TableOfContent,
} from "../types";

export async function getPostById(postId: string) {
	const post = await db.query.posts.findFirst({
		where: eq(posts.id, postId),
		with: {
			challengeTemplates: true,
		},
	});

	if (!post) return null;

	return {
		...post,
		content: post.content ? decompressContent(post.content) : null,
	};
}

// Fetch a post edit by its postId
export async function getEditPostByPostId(postId: string, userId: string) {
	const postEdit = await db.query.postEdits.findFirst({
		where: and(eq(postEdits.postId, postId), eq(postEdits.authorId, userId)),
		with: {
			challengeTemplates: true,
		},
	});

	if (!postEdit) return null;

	return {
		...postEdit,
		content: postEdit.content ? decompressContent(postEdit.content) : null,
	};
}

// Server-side function for fetching post edits with authorization
export async function getPostEditFromId(
	postId: string,
	queryParams?: Record<string, string | number | boolean>,
): Promise<PostWithExtraDetails | null> {
	// Get current user for authorization check
	const user = await validateUser();

	try {
		// Build authorization condition: user is the author or has permissions
		if (!user) {
			// No user, no access
			return null;
		}

		// Get the target userId (from query params or current user)
		const targetUserId = (queryParams?.user as string) || user.id;

		// Fetch postEdit for the target user
		const postEdit = await db.query.postEdits.findFirst({
			where: and(
				eq(postEdits.postId, postId),
				eq(postEdits.authorId, targetUserId),
			),
			with: {
				author: {
					columns: {
						id: true,
						username: true,
						name: true,
						image: true,
						companyName: true,
					},
				},
				challengeTemplates: true,
			},
		});

		if (!postEdit) return null;

		// Check authorization: current user must be the author or have permission
		if (user.id !== postEdit.authorId) {
			const hasEditReadPermission = await auth.api.userHasPermission({
				body: {
					userId: user.id,
					permission: { post: ["edit-read"] },
				},
			});

			if (!hasEditReadPermission?.success) {
				return null;
			}
		}

		const originalPost = await db.query.posts.findFirst({
			where: eq(posts.id, postId),
			with: {
				author: {
					columns: {
						id: true,
						username: true,
						name: true,
						image: true,
						companyName: true,
					},
				},
				contributors: {
					with: {
						user: {
							columns: {
								id: true,
								username: true,
								name: true,
								image: true,
							},
						},
					},
				},
			},
		});
		if (!originalPost) return null;

		const ContentHtml: ContentReturnType = {
			post: "",
			answer: "",
		};
		let tableOfContent: TableOfContent = [];

		if (postEdit.content) {
			// Decompress content using utility
			const decompressedContent = decompressContent(postEdit.content);
			const parsedContent = decompressedContent as ContentType;

			if (parsedContent.post?.blocks) {
				const postHtml = await getHtml(parsedContent.post.blocks);
				const { toc, htmlWithAnchors } = extractTOCAndEnhanceHTML(postHtml);
				ContentHtml.post = htmlWithAnchors;
				tableOfContent = toc;
			}
			if (parsedContent.answer?.blocks) {
				const answerHtml = await getHtml(parsedContent.answer.blocks);
				ContentHtml.answer = answerHtml;
			}
		}

		// Build contributors: original contributors + postEdit author (if not already present and not original author)
		const contributors = [
			...(originalPost.contributors?.map((contributor) => ({
				id: contributor.user.id,
				username: contributor.user.username,
				name: contributor.user.name,
				image: contributor.user.image,
			})) || []),
		];
		const isAlreadyContributor = contributors.some(
			(c) => c.id === postEdit.author?.id,
		);
		const isOriginalAuthor = originalPost.author?.id === postEdit.author?.id;
		if (postEdit.author && !isAlreadyContributor && !isOriginalAuthor) {
			contributors.push({
				id: postEdit.author.id,
				username: postEdit.author.username,
				name: postEdit.author.name,
				image: postEdit.author.image,
			});
		}

		const result = {
			...postEdit,
			id: postEdit.postId,
			slug: originalPost.slug,
			coins: originalPost.coins,
			status: originalPost.status,
			content: ContentHtml,
			completionCount: 0,
			tableOfContent,
			views: { count: 0, updatedAt: new Date() },
			challengeTemplates: postEdit.challengeTemplates,
			author: {
				id: originalPost.author?.id || "",
				username: originalPost.author?.username,
				name: originalPost.author?.name || null,
				image: originalPost.author?.image || null,
				companyName: originalPost.author?.companyName || null,
			},
			contributors,
		};

		return result as PostWithExtraDetails;
	} catch (error) {
		console.error("Error fetching post edit:", error);
		return null;
	}
}

export async function getAllApprovedPosts() {
	const postsList = await db.query.posts.findMany({
		where: eq(posts.approvalStatus, PostApprovalStatus.APPROVED),
		columns: {
			slug: true,
			id: true,
			category: true,
			subCategory: true,
			type: true,
			content: true,
		},
	});

	return postsList.map((post) => ({
		...post,
		content: post.content ? decompressContent(post.content) : null,
	}));
}

// Server-side function for static pages with enriched data
export async function getPostFromURL(
	titleSlug: string,
): Promise<PostWithExtraDetails | null> {
	const id = titleSlug.slice(-POST_ID_LENGTH);
	if (!id) return null;
	// Get current user for authorization check
	const user = await validateUser();

	try {
		// Fetch the post by id
		const post = await db.query.posts.findFirst({
			where: eq(posts.id, id),
			with: {
				author: {
					columns: {
						id: true,
						username: true,
						name: true,
						image: true,
						companyName: true,
					},
				},
				challengeTemplates: true,
				contributors: {
					with: {
						user: {
							columns: {
								id: true,
								username: true,
								name: true,
								image: true,
							},
						},
					},
				},
			},
		});

		if (!post) return null;

		// Authorization logic
		let authorized = false;
		if (post.approvalStatus === PostApprovalStatus.APPROVED) {
			authorized = true;
		} else if (user && post.authorId === user.id) {
			authorized = true;
		} else if (user) {
			const hasEditReadPermission = await auth.api.userHasPermission({
				body: {
					userId: user.id,
					permission: { post: ["edit-read"] },
				},
			});
			if (hasEditReadPermission?.success) {
				authorized = true;
			}
		}
		if (!authorized) return null;

		// Build result object
		const completionCountResult = await db
			.select({ count: count() })
			.from(completionStatuses)
			.where(eq(completionStatuses.postId, id));
		const completionCount = completionCountResult[0]?.count || 0;

		const viewsResult = await db.query.postViews.findFirst({
			where: eq(postViews.postId, id),
			columns: {
				count: true,
				updatedAt: true,
			},
		});

		const ContentHtml: ContentReturnType = {
			post: "",
			answer: "",
		};
		let tableOfContent: TableOfContent = [];

		if (post.content) {
			const decompressedContent = decompressContent(post.content);
			const parsedContent = decompressedContent as ContentType;

			if (parsedContent.post?.blocks) {
				const postHtml = await getHtml(parsedContent.post.blocks);
				const { toc, htmlWithAnchors } = extractTOCAndEnhanceHTML(postHtml);
				ContentHtml.post = htmlWithAnchors;
				tableOfContent = toc;
			}
			if (parsedContent.answer?.blocks) {
				const answerHtml = await getHtml(parsedContent.answer.blocks);
				ContentHtml.answer = answerHtml;
			}
		}

		const result = {
			...post,
			content: ContentHtml,
			completionCount,
			tableOfContent,
			views: viewsResult,
			challengeTemplates:
				post.challengeTemplates as unknown as ChallengeTemplate[],
			author: {
				id: post.author?.id || "",
				username: post.author?.username,
				name: post.author?.name || null,
				image: post.author?.image || null,
				companyName: post.author?.companyName || null,
			},
			contributors:
				post.contributors?.map((contributor) => ({
					id: contributor.user.id,
					username: contributor.user.username,
					name: contributor.user.name,
					image: contributor.user.image,
				})) || [],
		};

		return result as unknown as PostWithExtraDetails;
	} catch (error) {
		console.error("Error fetching post:", error);
		return null;
	}
}

// Shared filter builder function to ensure consistency between main and count queries
function buildWhereConditions({
	searchQuerySanitized,
	difficulty,
	topics,
	category,
	subCategory,
	type,
	companies,
}: {
	searchQuerySanitized: string;
	difficulty: Difficulty[];
	topics: string[];
	category?: PostCategory;
	subCategory?: SubCategory;
	type?: PostType;
	companies: string[];
}) {
	const conditions = [];

	// Add approval status condition to only return approved posts
	conditions.push(eq(posts.approvalStatus, PostApprovalStatus.APPROVED));

	if (category) conditions.push(eq(posts.category, category));
	if (subCategory) conditions.push(eq(posts.subCategory, subCategory));
	if (type) conditions.push(eq(posts.type, type));

	// Use full-text search with GIN index for optimal performance
	if (searchQuerySanitized) {
		conditions.push(
			sql`(
				setweight(to_tsvector('english', ${posts.title}), 'A') ||
				setweight(to_tsvector('english', array_to_string(${posts.companies}, ' ')), 'B') ||
				setweight(to_tsvector('english', array_to_string(${posts.topics}, ' ')), 'C')
			) @@ websearch_to_tsquery('english', ${searchQuerySanitized})`,
		);
	}

	if (difficulty.length > 0)
		conditions.push(inArray(posts.difficulty, difficulty));
	if (topics.length > 0) conditions.push(sql`${posts.topics} && ${topics}`);
	if (companies.length > 0)
		conditions.push(sql`${posts.companies} && ${companies}`);

	return conditions.length > 0 ? and(...conditions) : undefined;
}

export async function searchPosts({
	searchQuery,
	difficulty,
	topics,
	category,
	subCategory,
	page,
	pageSize,
	sortOrder = PostSortOrder.Latest,
	companies = [],
	type,
}: {
	searchQuery: string;
	difficulty: Difficulty[];
	topics: string[];
	category?: PostCategory;
	subCategory?: SubCategory;
	page: number;
	pageSize: number;
	sortOrder?: PostSortOrder | null;
	companies?: string[];
	type?: PostType;
}) {
	// Input validation
	if (page < 1) throw new Error(INVALID_PAGE);
	if (pageSize < 1) throw new Error(INVALID_PAGE_SIZE);

	// Ensure arrays are properly initialized
	const safeDifficulty = Array.isArray(difficulty) ? difficulty : [];
	const safeTopics = Array.isArray(topics) ? topics : [];
	const safeCompanies = Array.isArray(companies) ? companies : [];

	const searchQuerySanitized = sanitizeSearchQuery(searchQuery);
	const skip = (page - 1) * pageSize;

	// Build where conditions for core query builder
	const whereCondition = buildWhereConditions({
		searchQuerySanitized,
		difficulty: safeDifficulty,
		topics: safeTopics,
		category,
		subCategory,
		type,
		companies: safeCompanies,
	});

	// Determine order by direction with relevance ranking for search
	const orderByDirection = searchQuerySanitized
		? desc(sql`ts_rank(
		(
			setweight(to_tsvector('english', ${posts.title}), 'A') ||
			setweight(to_tsvector('english', array_to_string(${posts.companies}, ' ')), 'B') ||
			setweight(to_tsvector('english', array_to_string(${posts.topics}, ' ')), 'C')
		),
		websearch_to_tsquery('english', ${searchQuerySanitized})
	)`)
		: sortOrder === PostSortOrder.Oldest
			? asc(posts.createdAt)
			: desc(posts.createdAt);

	try {
		const [postsResult, totalCountResult] = await Promise.all([
			// Main posts query using core query syntax
			db
				.select({
					id: posts.id,
					title: posts.title,
					slug: posts.slug,
					createdAt: posts.createdAt,
					thumbnail: posts.thumbnail,
					difficulty: posts.difficulty,
					companies: posts.companies,
					type: posts.type,
					topics: posts.topics,
				})
				.from(posts)
				.where(whereCondition)
				.orderBy(orderByDirection)
				.limit(pageSize + 1)
				.offset(skip),

			// Count query
			db
				.select({ count: count() })
				.from(posts)
				.where(whereCondition)
				.then((result) => result[0]?.count || 0),
		]);

		const totalCount = totalCountResult;
		const hasMore = postsResult.length > pageSize;
		const resultPosts = hasMore ? postsResult.slice(0, pageSize) : postsResult;
		const totalPages = Math.ceil(totalCount / pageSize);

		return {
			posts: resultPosts,
			hasMore,
			totalPages,
		};
	} catch (error) {
		console.error("Error in searchPosts:", error);
		throw new Error("Failed to search posts");
	}
}

export interface PostSearchQueryParams {
	category: string;
	subCategory?: string;
	page?: number;
	pageSize?: number;
	sortOrder?: PostSortOrder;
	[key: string]: string | number | PostSortOrder | undefined;
}

export async function fetchPostSearch(
	params: PostSearchQueryParams,
): Promise<PostSearchResponse> {
	const queryParams = {
		...params,
		page: params.page ?? 1,
		pageSize: params.pageSize ?? 10,
		sortOrder: params.sortOrder ?? PostSortOrder.Latest,
	};

	const url = new URL(`${process.env.ENV_URL}${EndpointMap.PostSearch}`);
	for (const [key, value] of Object.entries(queryParams)) {
		if (value !== undefined && value !== null)
			url.searchParams.append(key, String(value));
	}

	const res = await fetch(url.toString(), { cache: "no-store" });
	if (!res.ok) throw new Error("Failed to fetch posts");
	return res.json();
}
