import { fetchPostById } from "@/utils/api utils/apiUtils";
import { POST_ROUTE_TYPE, UNKNOWN_ERROR } from "@/utils/constants";
import { ID_NOT_EXIST_ERROR } from "@/utils/errors";
import {
	ContentType,
	PostRouteType,
	PostWithContent,
	postCreateOptions,
} from "@/utils/types";
import {
	UseQueryOptions,
	UseQueryResult,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

// Fetch a post  from postEdits by its ID, bcz user might be editing a post
// , if it doesn't exist, fetch a post from posts

const fetchPost = async (postId: string): Promise<PostWithContent> => {
	try {
		return await fetchPostById(postId, POST_ROUTE_TYPE.EDIT);
	} catch {
		return await fetchPostById(postId);
	}
};

// Hook for fetching a post by ID
export function usePostEdit(
	postId: string | undefined,
	options?: postCreateOptions,
): UseQueryResult<PostWithContent, Error> {
	return useQuery<PostWithContent, Error>({
		queryKey: ["post", postId, options?.action],
		queryFn: () => fetchPost(postId!),
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
