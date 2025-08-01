import { PostEdit, User } from "@/db/schema/zod-schemas";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

interface PostEditWithAuthor extends PostEdit {
	author: Pick<User, "id" | "name" | "username" | "email">;
}

interface PaginationData {
	page: number;
	pageSize: number;
	totalEdits: number;
	totalPages: number;
}

interface UserPostEditsResponse {
	postEdits: PostEditWithAuthor[];
	pagination: PaginationData;
}

interface UseUserPostEditsParams {
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

export function useUserPostEdits(
	params?: UseUserPostEditsParams,
): UseQueryResult<UserPostEditsResponse, Error> {
	const {
		searchQuery = "",
		sortField = "createdAt",
		sortOrder = "desc",
		filters = {},
		page = 1,
		pageSize = 10,
	} = params || {};

	return useQuery<UserPostEditsResponse, Error>({
		queryKey: [
			"user-post-edits",
			searchQuery,
			sortField,
			sortOrder,
			filters,
			page,
			pageSize,
		],
		queryFn: async (): Promise<UserPostEditsResponse> => {
			const url = new URL("/api/post/user/edits", window.location.origin);

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
				throw new Error("Failed to fetch user post edits");
			}
			return response.json();
		},
	});
}
