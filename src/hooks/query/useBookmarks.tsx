import { UseQueryResult, useQuery } from "@tanstack/react-query";

interface BookmarkItem {
	id: string;
	postId: string;
	createdAt: string;
	title?: string;
	category?: string;
	subcategory?: string;
	type?: string;
	difficulty?: string;
	coins?: number;
	authorName?: string;
}

interface PaginationData {
	page: number;
	pageSize: number;
	totalBookmarks: number;
	totalPages: number;
}

interface BookmarksResponse {
	bookmarks: BookmarkItem[];
	pagination: PaginationData;
}

interface UseBookmarksParams {
	searchQuery?: string;
	filters?: {
		category?: string;
		subcategory?: string;
		type?: string;
		difficulty?: string;
	};
	page?: number;
	pageSize?: number;
}

export function useBookmarks(
	params?: UseBookmarksParams,
): UseQueryResult<BookmarksResponse, Error> {
	const {
		searchQuery = "",
		filters = {},
		page = 1,
		pageSize = 10,
	} = params || {};

	return useQuery<BookmarksResponse, Error>({
		queryKey: ["bookmarks", searchQuery, filters, page, pageSize],
		queryFn: async (): Promise<BookmarksResponse> => {
			const url = new URL("/api/bookmarks", window.location.origin);

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

			// Add pagination parameters
			url.searchParams.set("page", page.toString());
			url.searchParams.set("pageSize", pageSize.toString());

			const response = await fetch(url.toString());
			if (!response.ok) {
				throw new Error("Failed to fetch bookmarks");
			}
			return response.json();
		},
	});
}
