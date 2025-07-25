import { Post, User } from "@/db/schema/zod-schemas";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

interface PostWithAuthor extends Post {
	author: Pick<User, "id" | "name" | "username" | "email">;
}

interface PaginationData {
	page: number;
	pageSize: number;
	totalPosts: number;
	totalPages: number;
}

interface DraftApprovalResponse {
	posts: PostWithAuthor[];
	pagination: PaginationData;
}

interface UseDraftApprovalParams {
	searchQuery?: string;
	sortField?: string;
	sortOrder?: "asc" | "desc";
	filters?: {
		category?: string;
		subcategory?: string;
		type?: string;
		difficulty?: string;
		companies?: string[];
		topics?: string[];
	};
	page?: number;
	pageSize?: number;
}

export function useDraftApproval(
	params?: UseDraftApprovalParams,
): UseQueryResult<DraftApprovalResponse, Error> {
	const {
		searchQuery = "",
		sortField = "createdAt",
		sortOrder = "desc",
		filters = {},
		page = 1,
		pageSize = 10,
	} = params || {};

	return useQuery<DraftApprovalResponse, Error>({
		queryKey: [
			"draft-approval",
			searchQuery,
			sortField,
			sortOrder,
			filters,
			page,
			pageSize,
		],
		queryFn: async (): Promise<DraftApprovalResponse> => {
			const url = new URL("/api/post/draft/approval", window.location.origin);

			// Add sort parameters
			url.searchParams.set("sortField", sortField);
			url.searchParams.set("sortOrder", sortOrder);

			// Add search query
			if (searchQuery) {
				url.searchParams.set("search", searchQuery);
			}

			// Add filter parameters
			if (filters.category) {
				url.searchParams.set("category", filters.category);
			}
			if (filters.subcategory) {
				url.searchParams.set("subcategory", filters.subcategory);
			}
			if (filters.type) {
				url.searchParams.set("type", filters.type);
			}
			if (filters.difficulty) {
				url.searchParams.set("difficulty", filters.difficulty);
			}
			if (filters.companies && filters.companies.length > 0) {
				url.searchParams.set("companies", filters.companies.join(","));
			}
			if (filters.topics && filters.topics.length > 0) {
				url.searchParams.set("topics", filters.topics.join(","));
			}

			// Add pagination parameters
			url.searchParams.set("page", page.toString());
			url.searchParams.set("pageSize", pageSize.toString());

			const response = await fetch(url.toString());
			if (!response.ok) {
				throw new Error("Failed to fetch pending posts");
			}
			return response.json();
		},
	});
}
