import { fetchPostById } from "@/utils/api utils/apiUtils";
import { POST_ROUTE_TYPE, UNKNOWN_ERROR } from "@/utils/contants";
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

export function usePostDraft(
	postId: string | undefined,
	options?: postCreateOptions,
): UseQueryResult<PostWithContent, Error> {
	return useQuery<PostWithContent, Error>({
		queryKey: ["post", postId],
		queryFn: () => fetchPostById(postId!, POST_ROUTE_TYPE.DRAFTS),
		enabled: !!postId,
		...options,
	});
}

export function useInvalidatePost() {
	const queryClient = useQueryClient();
	return (postId: string) =>
		queryClient.invalidateQueries({ queryKey: ["post", postId] });
}
