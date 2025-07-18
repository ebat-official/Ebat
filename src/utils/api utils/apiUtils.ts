import { CompletionStatus } from "@/db/schema/zod-schemas";
import { UNKNOWN_ERROR } from "../constants";
import { ID_NOT_EXIST_ERROR } from "../errors";
import {
	ContentType,
	PostRouteType,
	PostWithContent,
	UserSearchResult,
} from "../types";

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
	username: string,
): Promise<UserSearchResult[]> {
	if (!username) {
		throw new Error("User name is required to fetch mentions.");
	}

	const response = await fetch(`/api/comments/users/${username}`);

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

export async function fetchCompletionStatuses(
	postIds: string[],
): Promise<CompletionStatus[]> {
	if (!postIds.length) return [];

	const postIdsParam = postIds.join(",");
	const response = await fetch(
		`/api/completionstatuses?postIds=${postIdsParam}`,
	);

	if (!response.ok) {
		let errorMessage = "Failed to fetch completion statuses.";
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
