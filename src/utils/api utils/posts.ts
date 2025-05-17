import pako from "pako";
import { validateUser } from "@/actions/user";
import prisma from "@/lib/prisma";
import {
	Difficulty,
	PostApprovalStatus,
	PostCategory,
	SubCategory,
} from "@prisma/client";
import { sanitizeSearchQuery } from "../sanitizeSearchQuery";
import { PostSearchResponse, PostSortOrder } from "../types";
import { EndpointMap } from "../contants";
export async function getPostById(postId: string) {
	const post = await prisma.post.findUnique({
		where: { id: postId },
	});

	if (post?.content) {
		post.content = JSON.parse(pako.inflate(post.content, { to: "string" }));
	}
	return post;
}

export async function getEditPostByPostId(postId: string) {
	const user = await validateUser();

	if (!user) return null;
	const postEdit = await prisma.postEdit.findUnique({
		where: {
			postId_authorId: {
				postId,
				authorId: user.id,
			},
		},
		select: {
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

	if (postEdit?.content) {
		postEdit.content = JSON.parse(
			pako.inflate(postEdit.content, { to: "string" }),
		);
	}

	return postEdit;
}

export async function getAllApprovedPosts() {
	const posts = await prisma.post.findMany({
		where: {
			approvalStatus: PostApprovalStatus.APPROVED,
		},
		select: {
			slug: true,
			id: true,
			category: true,
			subCategory: true,
			content: true, // Include content if needed
		},
	});

	return posts.map((post) => {
		if (post.content) {
			post.content = JSON.parse(pako.inflate(post.content, { to: "string" }));
		}
		return post;
	});
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
}) {
	const searchQuerySanitized = sanitizeSearchQuery(searchQuery);
	const skip = (page - 1) * pageSize;

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
		...(companies.length > 0 && {
			companies: {
				hasSome: companies,
			},
		}),
	};

	let orderBy: any = { createdAt: "desc" };
	if (sortOrder === PostSortOrder.Oldest) {
		orderBy = { createdAt: "asc" };
	} else if (sortOrder === "mostVotes") {
		orderBy = { votes: { _count: "desc" } };
	}

	// Validate user only if needed
	const user = await validateUser();

	const [posts, totalCount] = await Promise.all([
		prisma.post.findMany({
			where,
			select: {
				id: true,
				title: true,
				slug: true,
				createdAt: true,
				thumbnail: true,
				difficulty: true,
				companies: true,
				author: {
					select: {
						id: true,
						userName: true,
						userProfile: {
							select: {
								name: true,
								image: true,
								companyName: true,
							},
						},
					},
				},
				completionStatus: user
					? {
							where: { userId: user.id },
							select: { id: true },
						}
					: false,
				_count: {
					select: {
						votes: true,
						comments: true,
					},
				},
			},
			orderBy,
			skip,
			take: pageSize + 1, // check for next page
		}),

		prisma.post.count({ where }),
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
	[key: string]: any;
}

export async function fetchPostSearch(
	params: PostSearchQueryParams,
): Promise<PostSearchResponse> {
	const queryParams = {
		...params,
		subCategory: params.subCategory,
		cateogory: params.category,
		page: params.page ?? 1,
		pageSize: params.pageSize ?? 10,
		sortOrder: params.sortOrder ?? PostSortOrder.Latest,
	};

	const url = new URL(`${process.env.ENV_URL}${EndpointMap.PostSearch}`);
	Object.entries(queryParams).forEach(([key, value]) => {
		if (value !== undefined && value !== null)
			url.searchParams.append(key, String(value));
	});

	const res = await fetch(url.toString(), { cache: "no-store" });
	if (!res.ok) throw new Error("Failed to fetch posts");
	return res.json();
}
