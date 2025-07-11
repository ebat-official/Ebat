import { POST_ID_LENGTH } from "@/config";
import { UNKNOWN_ERROR } from "../contants";
import { ID_NOT_EXIST_ERROR } from "../errors";
import { isValidCategoryCombo } from "../isValidCategoryCombo";
import { CommentMention } from "@/db/schema/zod-schemas";
import { PostType } from "@/db/schema/enums";
import {
	ContentType,
	PostWithContent,
	PostRouteType,
	PostWithExtraDetails,
	UserSearchResult,
	ContentReturnType,
	TableOfContent,
	ChallengeTemplate,
} from "../types";
import { PostCategory, SubCategory } from "@/db/schema/enums";
import { db } from "@/db";
import { posts, postViews, challengeTemplates, completionStatuses } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import pako from "pako";
import { getHtml } from "@/components/shared/Lexical Editor/utils/SSR/jsonToHTML";
import { extractTOCAndEnhanceHTML } from "@/components/shared/Lexical Editor/utils/SSR/extractTOCAndEnhanceHTML";

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
