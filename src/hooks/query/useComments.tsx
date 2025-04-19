// lib/hooks/useComments.ts

import {
	useQuery,
	UseQueryResult,
	useQueryClient,
} from "@tanstack/react-query";
import { fetchComments } from "@/utils/api utils/comment";
import type { CommentSortOption, PaginatedComments } from "@/utils/types"; // Replace with actual path
import { COMMENT_SORT_OPTIONS } from "@/utils/contants";

interface UseCommentsOptions {
	page?: number;
	take?: number;
	depth?: number;
	sort?: CommentSortOption;
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
		],
		queryFn: () =>
			fetchComments(postId!, {
				page: options?.page || 1,
				take: options?.take || 10,
				depth: options?.depth || 1,
				sort: options?.sort || COMMENT_SORT_OPTIONS.TOP,
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
