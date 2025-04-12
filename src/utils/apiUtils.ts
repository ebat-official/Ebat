import { UNKNOWN_ERROR } from "./contants";
import { ID_NOT_EXIST_ERROR } from "./errors";
import { ContentType, PostWithContent, PostRouteType } from "./types";

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
