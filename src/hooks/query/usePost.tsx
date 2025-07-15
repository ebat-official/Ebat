import { fetchPostById } from "@/utils/api utils/apiUtils";
import { PostWithContent, postCreateOptions } from "@/utils/types";
import {
	UseQueryOptions,
	UseQueryResult,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

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
