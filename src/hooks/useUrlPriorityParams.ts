import { useSearchParams } from "next/navigation";
import { PostSortOrder } from "@/utils/types";
import { PostType } from "@/db/schema/enums";

interface QueryParams {
	searchQuery?: string;
	difficulty?: string[];
	topics?: string[];
	category?: string;
	subCategory?: string;
	companies?: string[];
	page?: number;
	pageSize?: number;
	sortOrder?: PostSortOrder;
	type?: PostType;
	enabled?: boolean;
}

export function useUrlPriorityParams(fallbackParams: QueryParams) {
	const searchParams = useSearchParams();

	// Helper function to get URL parameter with fallback
	const getUrlParam = (key: string, fallback?: string) => {
		const urlValue = searchParams.get(key);
		return urlValue !== null ? urlValue : fallback;
	};

	// Helper function to get array URL parameters with fallback
	const getUrlArrayParam = (key: string, fallback?: string[]) => {
		const urlValues = searchParams.getAll(key);
		return urlValues.length > 0 ? urlValues : fallback;
	};

	// Helper function to get number URL parameter with fallback
	const getUrlNumberParam = (key: string, fallback?: number) => {
		const urlValue = searchParams.get(key);
		return urlValue !== null ? Number.parseInt(urlValue, 10) : fallback;
	};

	return {
		searchQuery: getUrlParam("searchQuery", fallbackParams.searchQuery),
		difficulty: getUrlArrayParam("difficulty", fallbackParams.difficulty),
		topics: getUrlArrayParam("topics", fallbackParams.topics),
		category: getUrlParam("category", fallbackParams.category),
		subCategory: getUrlParam("subCategory", fallbackParams.subCategory),
		companies: getUrlArrayParam("companies", fallbackParams.companies),
		page: getUrlNumberParam("page", fallbackParams.page ?? 1),
		pageSize: getUrlNumberParam("pageSize", fallbackParams.pageSize ?? 10),
		sortOrder:
			(getUrlParam("sortOrder") as PostSortOrder) ||
			fallbackParams.sortOrder ||
			PostSortOrder.Latest,
		type: (getUrlParam("type") as PostType) || fallbackParams.type,
		enabled: fallbackParams.enabled, // enabled doesn't come from URL
	};
}
