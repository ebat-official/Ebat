import { fetchCompletionStatuses } from "@/utils/api utils/apiUtils";
import { CompletionStatus } from "@/db/schema/zod-schemas";
import {
	UseQueryOptions,
	UseQueryResult,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

// Hook for fetching completion statuses for multiple posts
export function useCompletionStatuses(
	postIds: string[] | undefined,
	options?: UseQueryOptions<CompletionStatus[], Error>,
): UseQueryResult<CompletionStatus[], Error> {
	return useQuery<CompletionStatus[], Error>({
		queryKey: ["completionStatuses", postIds],
		queryFn: () => fetchCompletionStatuses(postIds!),
		enabled: !!postIds && postIds.length > 0,
		...options,
	});
}

// Hook for invalidating completion statuses queries
export function useInvalidateCompletionStatuses() {
	const queryClient = useQueryClient();
	return (postIds?: string[]) =>
		queryClient.invalidateQueries({
			queryKey: ["completionStatuses", postIds],
		});
}
