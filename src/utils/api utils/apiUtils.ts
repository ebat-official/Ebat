import { POST_ID_LENGTH } from "@/config";
import { UNKNOWN_ERROR } from "../contants";
import { ID_NOT_EXIST_ERROR } from "../errors";
import { isValidCategoryCombo } from "../isValidCategoryCombo";
import { CommentMention, PostType } from "@prisma/client";
import {
	ContentType,
	PostWithContent,
	PostRouteType,
	PostWithExtraDetails,
	UserSearchResult,
	ContentReturnType,
} from "../types";
import { PostCategory, SubCategory } from "@prisma/client";
import prisma from "@/lib/prisma";
import pako from "pako";
import { getHtml } from "@/components/shared/Lexical Editor/utils/SSR/jsonToHTML";

export const fetchPostById = async (
	postId: string,
	PostrouteType?: PostRouteType,
): Promise<PostWithContent> => {
	if (!postId) throw ID_NOT_EXIST_ERROR;

	const res = await fetch(
		`/api/post/${PostrouteType ? `${PostrouteType}/` : ""}${postId}`,
	);

	if (!res.ok) {
		let errorMessage = UNKNOWN_ERROR;
		try {
			const errorData = await res.json();
			errorMessage = errorData || UNKNOWN_ERROR;
		} catch {}
		throw errorMessage;
	}

	const post = await res.json();
	return { ...post, content: post.content as ContentType };
};

export async function getPostFromURL(params: {
	category: string;
	subCategory: string;
	titleSlug: string;
}): Promise<PostWithExtraDetails | null> {
	const { titleSlug, category, subCategory } = params;

	// will do it later if required
	// if (!isValidCategoryCombo(category, subCategory)) {
	// 	return null;
	// }

	const id = titleSlug.slice(-POST_ID_LENGTH);
	if (!id) return null;

	try {
		const post = await prisma.post.findUnique({
			where: {
				id,
			},
			include: {
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
				_count: {
					select: {
						completionStatus: true,
					},
				},
				collaborators: {
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
			},
		});

		if (!post) return null;

		const ContentHtml: ContentReturnType = {
			post: "",
			answer: "",
		};

		if (post.content) {
			const parsedContent = JSON.parse(
				pako.inflate(post.content, { to: "string" }),
			) as ContentType;

			if (parsedContent.post?.blocks) {
				const postHtml = await getHtml(parsedContent.post.blocks);
				ContentHtml.post = postHtml;
			}
			if (parsedContent.answer?.blocks) {
				const answerHtml = await getHtml(parsedContent.answer.blocks);
				ContentHtml.answer = answerHtml;
			}
		}

		const completionCount = post._count?.completionStatus || 0;

		return {
			...post,
			content: ContentHtml,
			completionCount,
		};
	} catch (error) {
		console.error("Error fetching post:", error);
		return null;
	}
}

export async function fetchMentionsByCommentId(
	commentId: string,
): Promise<UserSearchResult[]> {
	if (!commentId) {
		throw new Error("Comment ID is required to fetch mentions.");
	}

	const response = await fetch(`/api/comments/mentions/${commentId}`);

	if (!response.ok) {
		let errorMessage = "Failed to fetch mentions.";
		try {
			const errorData = await response.json();
			errorMessage = errorData.error || errorMessage;
		} catch {
			// Ignore JSON parsing errors and use the default error message
		}
		throw new Error(errorMessage);
	}

	return response.json();
}

export async function fetchCommentUsersByUserName(
	userName: string,
): Promise<UserSearchResult[]> {
	if (!userName) {
		throw new Error("User name is required to fetch mentions.");
	}

	const response = await fetch(`/api/comments/users/${userName}`);

	if (!response.ok) {
		let errorMessage = "Failed to fetch mentions.";
		try {
			const errorData = await response.json();
			errorMessage = errorData.error || errorMessage;
		} catch {
			// Ignore JSON parsing errors and use the default error message
		}
		throw new Error(errorMessage);
	}

	return response.json();
}
