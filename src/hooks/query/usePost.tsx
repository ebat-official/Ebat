import { UNKNOWN_ERROR } from "@/utils/contants";
import { ID_NOT_EXIST_ERROR } from "@/utils/errors";
import { ContentType, postCreateOptions, PostWithContent } from "@/utils/types";
import {
	useQuery,
	useQueryClient,
	UseQueryOptions,
	UseQueryResult,
} from "@tanstack/react-query";

// Fetch a post by its ID
const fetchPostById = async (postId: string): Promise<PostWithContent> => {
	if (!postId) throw ID_NOT_EXIST_ERROR;

	const res = await fetch(`/api/posts/${postId}`);

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

// Hook for fetching a post by ID
export function usePost(
	postId: string | undefined,
	options?: postCreateOptions,
): UseQueryResult<PostWithContent, Error> {
	return useQuery<PostWithContent, Error>({
		queryKey: ["post", postId, options?.action],
		queryFn: () => fetchPostById(postId!),
		enabled: !!postId,
		...options,
	});
}

// Hook for invalidating a post query
export function useInvalidatePost() {
	const queryClient = useQueryClient();
	return (postId: string) =>
		queryClient.invalidateQueries({ queryKey: ["post", postId] });
}
