// lib/hooks/useComments.ts

import { fetchComments } from "@/utils/api utils/comment";
import { COMMENT_SORT_OPTIONS } from "@/utils/constants";
import type { CommentSortOption, PaginatedComments } from "@/utils/types"; // Replace with actual path
import {
	UseQueryResult,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

interface UseCommentsOptions {
	page?: number;
	take?: number;
	depth?: number;
	sort?: CommentSortOption;
	skip?: number;
}

// Hook for fetching comments for a given post
export function useComments(
	postId: string | undefined,
	options?: UseCommentsOptions,
): UseQueryResult<PaginatedComments, Error> {
	return useQuery<PaginatedComments, Error>({
		queryKey: [
			"comments",
			postId,
			options?.page,
			options?.take,
			options?.depth,
			options?.sort,
			options?.skip,
		],
		queryFn: () =>
			fetchComments(postId!, {
				...options,
			}),
		enabled: !!postId, // Ensure the query is only run when postId is available
		...options, // Spread in additional options passed to the hook
	});
}

// Hook for invalidating comments query
export function useInvalidateComments() {
	const queryClient = useQueryClient();
	return (postId: string) =>
		queryClient.invalidateQueries({ queryKey: ["comments", postId] });
}
