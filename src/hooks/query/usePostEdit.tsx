import { POST } from "@/app/api/auth/[...nextauth]/route";
import { fetchPostById } from "@/utils/api utils/apiUtils";
import { POST_ROUTE_TYPE, UNKNOWN_ERROR } from "@/utils/contants";
import { ID_NOT_EXIST_ERROR } from "@/utils/errors";
import {
	ContentType,
	postCreateOptions,
	PostRouteType,
	PostWithContent,
} from "@/utils/types";
import {
	useQuery,
	useQueryClient,
	UseQueryOptions,
	UseQueryResult,
} from "@tanstack/react-query";

// Fetch a post by its ID

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
