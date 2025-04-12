import { POST_ID_LENGTH } from "@/config";
import { UNKNOWN_ERROR } from "./contants";
import { ID_NOT_EXIST_ERROR } from "./errors";
import { isValidCategoryCombo } from "./isValidCategoryCombo";
import { PostWithAuthor } from "./metadata";
import { ContentType, PostWithContent, PostRouteType } from "./types";
import { PostCategory, SubCategory } from "@prisma/client";
import prisma from "@/lib/prisma";

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
}): Promise<PostWithAuthor | null> {
	const { titleSlug, category, subCategory } = params;

	if (!isValidCategoryCombo(category, subCategory)) {
		return null;
	}

	const id = titleSlug.slice(-POST_ID_LENGTH);
	if (!id) return null;

	try {
		return await prisma.post.findUnique({
			where: {
				id,
				category: category.toUpperCase() as PostCategory,
				...(subCategory &&
					subCategory !== "general" && {
						subCategory: subCategory.toUpperCase() as SubCategory,
					}),
			},
			include: {
				author: {
					select: {
						name: true,
					},
				},
			},
		});
	} catch (error) {
		console.error("Error fetching post:", error);
		return null;
	}
}
