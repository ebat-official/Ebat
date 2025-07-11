import { validateUser } from "@/actions/user";
import { db } from "@/db";
import {
	posts,
	postEdits,
	challengeTemplates,
	postViews,
	completionStatuses,
} from "@/db/schema";
import { eq, and, desc, asc, count, inArray, ilike, sql } from "drizzle-orm";
import {
	Difficulty,
	PostApprovalStatus,
	PostCategory,
	PostType,
	SubCategory,
} from "@/db/schema/enums";
import { sanitizeSearchQuery } from "../sanitizeSearchQuery";
import { PostSearchResponse, PostSortOrder } from "../types";
import { EndpointMap } from "../contants";
import { t } from "@excalidraw/excalidraw/i18n";
import { decompressContent, type JsonContent } from "../compression";
import { POST_ID_LENGTH } from "@/config";
import {
	ContentType,
	PostWithExtraDetails,
	ContentReturnType,
	TableOfContent,
	ChallengeTemplate,
} from "../types";
import { getHtml } from "@/components/shared/Lexical Editor/utils/SSR/jsonToHTML";
import { extractTOCAndEnhanceHTML } from "@/components/shared/Lexical Editor/utils/SSR/extractTOCAndEnhanceHTML";

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

export async function getEditPostByPostId(postId: string) {
	const user = await validateUser();

	if (!user) return null;
	const postEdit = await db.query.postEdits.findFirst({
		where: and(eq(postEdits.postId, postId), eq(postEdits.authorId, user.id)),
		columns: {
			id: true,
			postId: true,
			authorId: true,
			title: true,
			content: true,
			approvalStatus: true,
			createdAt: true,
			updatedAt: true,
			type: true,
			difficulty: true,
			companies: true,
			completionDuration: true,
			topics: true,
		},
	});

	if (!postEdit) return null;

	return {
		...postEdit,
		content: postEdit.content ? decompressContent(postEdit.content) : null,
	};
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
export async function getPostFromURL(params: {
	category: string;
	subCategory: string;
	titleSlug: string;
}): Promise<PostWithExtraDetails | null> {
	const { titleSlug, category, subCategory } = params;

	const id = titleSlug.slice(-POST_ID_LENGTH);
	if (!id) return null;

	try {
		const post = await db.query.posts.findFirst({
			where: eq(posts.id, id),
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
								companyName: true,
							},
						},
					},
				},
				challengeTemplates: true,
				collaborators: {
					with: {
						user: {
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
					},
				},
			},
		});

		if (!post) return null;

		// Get completion count
		const completionCountResult = await db
			.select({ count: count() })
			.from(completionStatuses)
			.where(eq(completionStatuses.postId, id));

		const completionCount = completionCountResult[0]?.count || 0;

		// Get views
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
			// Decompress content using utility
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
				userName: post.author?.userName || "",
				profile: post.author?.profile || null,
			},
			collaborators:
				post.collaborators?.map((collaborator) => ({
					id: collaborator.user.id,
					userName: collaborator.user.userName,
					profile: collaborator.user.profile,
				})) || [],
		};

		return result as unknown as PostWithExtraDetails;
	} catch (error) {
		console.error("Error fetching post:", error);
		return null;
	}
}

// utils/api-utils/search.ts

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
	const searchQuerySanitized = sanitizeSearchQuery(searchQuery);
	const skip = (page - 1) * pageSize;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const where: any = {
		...(searchQuerySanitized && {
			title: {
				search: searchQuerySanitized,
			},
		}),
		...(difficulty.length > 0 && {
			difficulty: {
				in: difficulty,
			},
		}),
		...(topics.length > 0 && {
			topics: {
				hasSome: topics,
			},
		}),
		...(category && { category }),
		...(subCategory && { subCategory }),
		...(type && { type }),
		...(companies.length > 0 && {
			companies: {
				hasSome: companies,
			},
		}),
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let orderBy: any = { createdAt: "desc" };
	if (sortOrder === PostSortOrder.Oldest) {
		orderBy = { createdAt: "asc" };
	} else if (sortOrder === "mostVotes") {
		orderBy = { votes: { _count: "desc" } };
	}

	const [posts, totalCount] = await Promise.all([
		db.query.posts.findMany({
			where,
			columns: {
				id: true,
				title: true,
				slug: true,
				createdAt: true,
				thumbnail: true,
				difficulty: true,
				companies: true,
				type: true,
				topics: true,
			},
			with: {
				views: true,
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
								companyName: true,
							},
						},
					},
				},
			},
			orderBy,
			limit: pageSize + 1, // check for next page
			offset: skip,
		}),

		// @ts-expect-error: Complex Drizzle query types
		db.query.posts.count({ where }),
	]);

	const hasMore = posts.length > pageSize;
	const resultPosts = hasMore ? posts.slice(0, pageSize) : posts;
	const totalPages = Math.ceil(totalCount / pageSize);

	return {
		posts: resultPosts,
		hasMore,
		totalPages,
	};
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
