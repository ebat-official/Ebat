import pako from "pako";
import { validateUser } from "@/actions/user";
import { UNAUTHENTICATED_ERROR } from "../errors";
import prisma from "@/lib/prisma";
import {
	Difficulty,
	PostApprovalStatus,
	PostCategory,
	SubCategory,
} from "@prisma/client";
import { sanitizeSearchQuery } from "../sanitizeSearchQuery";
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
}: {
	searchQuery: string;
	difficulty: Difficulty[];
	topics: string[];
	category?: PostCategory; // Optional category filter
	subCategory?: SubCategory; // Optional subcategory filter
	page: number;
	pageSize: number;
}) {
	const searchQuerySanitized = sanitizeSearchQuery(searchQuery);
	// Calculate pagination
	console.log("searchQuerySanitized", searchQuerySanitized);
	const skip = (page - 1) * pageSize;
	const user = await validateUser();

	// Perform the search with filters
	const posts = await prisma.post.findMany({
		where: {
			...(searchQuerySanitized && {
				title: {
					search: searchQuerySanitized, // Prisma search functionality
				},
			}),
			...(difficulty.length > 0 && {
				difficulty: {
					in: difficulty,
				},
			}),
			...(topics.length > 0 && {
				topics: {
					hasSome: topics, // Filter posts that match any of the topics
				},
			}),
			...(category && {
				category: category, // Filter by category
			}),
			...(subCategory && {
				subCategory: subCategory, // Filter by subcategory
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
		},
		orderBy: {
			createdAt: "desc", // Fallback ordering by createdAt
		},
		skip,
		take: pageSize,
	});

	return posts;
}
