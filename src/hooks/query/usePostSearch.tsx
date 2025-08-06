import { Post } from "@/db/schema/zod-schemas";
import { EndpointMap } from "@/utils/constants";
import {
	PostSearchContext,
	PostSearchResponse,
	UsePostSearchOptions,
} from "@/utils/types";
import { PostType } from "@/db/schema/enums";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
// Import the API response type directly from the endpoint if exported
// If not, you can define it here or use zod/yup inference if available

// Hook for fetching posts with search and context, SSG aware
export function usePostSearch(
	queryParams: Omit<UsePostSearchOptions, "initialPosts" | "initialContext">,
	initialPosts: PostSearchResponse["posts"] = [],
	initialContext: PostSearchContext = {
		hasMorePage: false,
		totalPages: 1,
		page: 1,
	},
): UseQueryResult<PostSearchResponse, Error> {
	return useQuery<PostSearchResponse, Error>({
		queryKey: [
			"posts",
			queryParams.searchQuery,
			JSON.stringify(queryParams.difficulty || []),
			JSON.stringify(queryParams.topics || []),
			queryParams.category,
			queryParams.subCategory,
			JSON.stringify(queryParams.companies || []),
			queryParams.type,
			queryParams.page,
			queryParams.pageSize,
			queryParams.sortOrder,
		],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (queryParams.searchQuery)
				params.append("searchQuery", queryParams.searchQuery);
			if (queryParams.difficulty) {
				for (const d of queryParams.difficulty) {
					params.append("difficulty", d);
				}
			}
			if (queryParams.topics) {
				for (const t of queryParams.topics) {
					params.append("topics", t);
				}
			}
			if (queryParams.category) params.append("category", queryParams.category);
			if (queryParams.subCategory)
				params.append("subCategory", queryParams.subCategory);
			if (queryParams.companies) {
				for (const c of queryParams.companies) {
					params.append("companies", c);
				}
			}
			if (queryParams.type) params.append("type", queryParams.type);
			if (queryParams.page) params.append("page", String(queryParams.page));
			if (queryParams.pageSize)
				params.append("pageSize", String(queryParams.pageSize));
			if (queryParams.sortOrder)
				params.append("sortOrder", queryParams.sortOrder);

			const res = await fetch(`${EndpointMap.PostSearch}?${params.toString()}`);
			if (!res.ok) throw new Error("Failed to fetch posts");
			return res.json();
		},
		initialData: { posts: initialPosts, context: initialContext },
		// staleTime: 1000 * 60 * 60 * 24, // 1 day
		enabled: queryParams.enabled !== false, // allow disabling if needed
	});
}
