"use client";
import React, { createContext, useContext, useState } from "react";
import {
	PostSearchContext,
	PostSearchResponse,
	PostSortOrder,
} from "@/utils/types";
import { usePostSearch } from "@/hooks/query/usePostSearch";

// Types for the context value
export interface FeedContextType {
	posts: PostSearchResponse["posts"];
	context: PostSearchContext;
	isLoading: boolean;
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
	sortOrder: PostSortOrder | undefined;
	setSortOrder: React.Dispatch<React.SetStateAction<PostSortOrder | undefined>>;
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
	const [page, setPage] = useState<number>(queryParams.page ?? 1);
	const [pageSize, setPageSize] = useState<number>(queryParams.pageSize ?? 10);
	const [sortOrder, setSortOrder] = useState<PostSortOrder | undefined>(
		queryParams.sortOrder,
	);

	const { data, isLoading, refetch } = usePostSearch(
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

	return (
		<FeedContext.Provider
			value={{
				posts: data?.posts ?? [],
				context: data?.context ?? initialContext,
				isLoading,
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
			}}
		>
			{children}
		</FeedContext.Provider>
	);
};
