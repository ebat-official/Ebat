"use client";
import { getCompletionStatusesForPosts } from "@/actions/completionStatus";
import { usePostSearch } from "@/hooks/query/usePostSearch";
import {
	PostSearchContext,
	PostSearchResponse,
	PostSortOrder,
} from "@/utils/types";
import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	use,
} from "react";

// Types for the context value
export interface FeedContextType {
	posts: PostSearchResponse["posts"];
	context: PostSearchContext;
	isLoadingData: boolean;
	refetch: () => void;
	searchQuery: string | undefined;
	setSearchQuery: React.Dispatch<React.SetStateAction<string | undefined>>;
	difficulty: string[] | undefined;
	setDifficulty: React.Dispatch<React.SetStateAction<string[] | undefined>>;
	topics: string[] | undefined;
	setTopics: React.Dispatch<React.SetStateAction<string[] | undefined>>;
	category: string | undefined;
	setCategory: React.Dispatch<React.SetStateAction<string | undefined>>;
	subCategory: string | undefined;
	setSubCategory: React.Dispatch<React.SetStateAction<string | undefined>>;
	companies: string[] | undefined;
	setCompanies: React.Dispatch<React.SetStateAction<string[] | undefined>>;
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	pageSize: number;
	setPageSize: React.Dispatch<React.SetStateAction<number>>;
	sortOrder: PostSortOrder;
	setSortOrder: React.Dispatch<React.SetStateAction<PostSortOrder>>;
	completionStatuses: Record<string, boolean>;
	accumulatedPosts: PostSearchResponse["posts"];
	isLoading: boolean;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export function useFeedContext() {
	const ctx = useContext(FeedContext);
	if (!ctx) throw new Error("useFeedContext must be used within FeedProvider");
	return ctx;
}

interface FeedProviderProps {
	initialPosts: PostSearchResponse["posts"];
	initialContext: PostSearchContext;
	queryParams: {
		searchQuery?: string;
		difficulty?: string[];
		topics?: string[];
		category?: string;
		subCategory?: string;
		companies?: string[];
		page?: number;
		pageSize?: number;
		sortOrder?: PostSortOrder;
		enabled?: boolean;
	};
	children: React.ReactNode;
}

export const FeedProvider: React.FC<FeedProviderProps> = ({
	initialPosts,
	initialContext,
	queryParams,
	children,
}) => {
	const [searchQuery, setSearchQuery] = useState<string | undefined>(
		queryParams.searchQuery,
	);
	const [difficulty, setDifficulty] = useState<string[] | undefined>(
		queryParams.difficulty,
	);
	const [topics, setTopics] = useState<string[] | undefined>(
		queryParams.topics,
	);
	const [category, setCategory] = useState<string | undefined>(
		queryParams.category,
	);
	const [subCategory, setSubCategory] = useState<string | undefined>(
		queryParams.subCategory,
	);
	const [companies, setCompanies] = useState<string[] | undefined>(
		queryParams.companies,
	);
	const [completionStatuses, setCompletionStatuses] = useState<
		Record<string, boolean>
	>({});
	const [page, setPage] = useState<number>(queryParams.page ?? 1);
	const [pageSize, setPageSize] = useState<number>(queryParams.pageSize ?? 10);
	const [sortOrder, setSortOrder] = useState<PostSortOrder>(
		queryParams.sortOrder || PostSortOrder.Latest,
	);

	// NEW: Accumulated posts state
	const [accumulatedPosts, setAccumulatedPosts] =
		useState<PostSearchResponse["posts"]>(initialPosts);

	const { data, isLoading, refetch, isFetching } = usePostSearch(
		{
			searchQuery,
			difficulty,
			topics,
			category,
			subCategory,
			companies,
			page,
			pageSize,
			sortOrder,
			enabled: queryParams.enabled,
		},
		initialPosts,
		initialContext,
	);

	const isLoadingData = isLoading || isFetching;

	// Accumulate posts when page increases, reset when filters/search change

	useEffect(() => {
		setPage(1);
		setAccumulatedPosts([]);
	}, [
		searchQuery,
		difficulty,
		topics,
		category,
		subCategory,
		companies,
		sortOrder,
	]);

	useEffect(() => {
		if (!data?.posts) return;
		setAccumulatedPosts((prev) => [...prev, ...data.posts]);
	}, [data?.posts]);

	useEffect(() => {
		const fetchStatuses = async () => {
			if (!data?.posts?.length) {
				setCompletionStatuses({});
				return;
			}
			const postIds = data.posts.map((post) => post.id);
			const statuses = await getCompletionStatusesForPosts(postIds);
			const statusMap: Record<string, boolean> = {};
			statuses.forEach((status) => {
				statusMap[status.postId] = true;
			});
			setCompletionStatuses(statusMap);
		};
		fetchStatuses();
	}, [data?.posts]);

	return (
		<FeedContext.Provider
			value={{
				posts: data?.posts ?? [], // Use accumulated posts here
				context: data?.context ?? initialContext,
				isLoadingData,
				refetch,
				searchQuery,
				setSearchQuery,
				difficulty,
				setDifficulty,
				topics,
				setTopics,
				category,
				setCategory,
				subCategory,
				setSubCategory,
				companies,
				setCompanies,
				page,
				setPage,
				pageSize,
				setPageSize,
				sortOrder,
				setSortOrder,
				completionStatuses,
				accumulatedPosts,
				isLoading,
			}}
		>
			{children}
		</FeedContext.Provider>
	);
};
