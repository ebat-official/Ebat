import { COMMENT_SORT_OPTIONS } from "@/utils/contants";
import { redis } from "./redis";

export const invalidateCommentsCache = async (postId: string) => {
	const sortOptions = Object.values(COMMENT_SORT_OPTIONS);

	const keys = sortOptions.map((sort) => `comments:${postId}:p:1:s:${sort}`);

	try {
		if (keys.length > 0) {
			await redis.del(...keys);
		}
	} catch (err) {
		console.error("Failed to invalidate comment cache:", err);
	}
};
