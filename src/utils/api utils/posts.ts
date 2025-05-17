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
import { ContentType, PostSortOrder } from "../types";
import { getHtml } from "@/components/shared/Lexical Editor/utils/SSR/jsonToHTML";
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
}: {
	searchQuery: string;
	difficulty: Difficulty[];
	topics: string[];
	category?: PostCategory;
	subCategory?: SubCategory;
	page: number;
	pageSize: number;
	sortOrder?: PostSortOrder | null;
}) {
	const searchQuerySanitized = sanitizeSearchQuery(searchQuery);
	const skip = (page - 1) * pageSize;
	const user = await validateUser();

	let orderBy: any = { createdAt: "desc" };
	if (sortOrder === "oldest") {
		orderBy = { createdAt: "asc" };
	} else if (sortOrder === "mostVotes") {
		orderBy = { votes: { _count: "desc" } };
	}

	// Fetch one extra post to check if there is a next page
	const posts = await prisma.post.findMany({
		where: {
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
			...(category && {
				category: category,
			}),
			...(subCategory && {
				subCategory: subCategory,
			}),
		},
		select: {
			id: true,
			title: true,
			slug: true,
			createdAt: true,
			thumbnail: true,
			difficulty: true,
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
			completionStatus: {
				where: {
					userId: user?.id,
				},
				select: {
					id: true,
				},
			},
			_count: {
				select: {
					votes: true,
					comments: true,
				},
			},
		},
		orderBy,
		skip,
		take: pageSize + 1, // Fetch one extra to check for more pages
	});

	const hasMore = posts.length > pageSize;
	const resultPosts = hasMore ? posts.slice(0, pageSize) : posts;

	// Calculate total pages (optional: you may want to optimize this with a count query)
	let totalPages = page;
	try {
		const totalCount = await prisma.post.count({
			where: {
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
				...(category && {
					category: category,
				}),
				...(subCategory && {
					subCategory: subCategory,
				}),
			},
		});
		totalPages = Math.ceil(totalCount / pageSize);
	} catch (err) {
		// fallback: just use current page
	}

	return {
		posts: resultPosts,
		hasMore,
		totalPages,
	};
}
