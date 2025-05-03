"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { CommentSortOption, CommentWithVotes } from "@/utils/types";
import { COMMENT_SORT_OPTIONS } from "@/utils/contants";
import { useComments } from "@/hooks/query/useComments";

type CommentContextType = {
	comments: CommentWithVotes[];
	totalComments: number;
	isLoading: boolean;
	currentPage: number;
	commentSortOption: CommentSortOption;
	setCurrentPage: (page: number) => void;
	setCommentSortOption: (option: CommentSortOption) => void;
	addComment: (comment: CommentWithVotes) => void;
	postId: string;
	totalPages: number;
};

const CommentContext = createContext<CommentContextType | undefined>(undefined);

export const useCommentContext = () => {
	const context = useContext(CommentContext);
	if (!context) {
		throw new Error("useCommentContext must be used within a CommentProvider");
	}
	return context;
};

type CommentProviderProps = {
	postId: string;
	children: React.ReactNode;
};

const COMMENTS_TAKE = 5;

export const CommentProvider: React.FC<CommentProviderProps> = ({
	postId,
	children,
}) => {
	const [currentPage, setCurrentPage] = useState(1);
	const [commentSortOption, setCommentSortOption] = useState<CommentSortOption>(
		COMMENT_SORT_OPTIONS.TOP,
	);
	const [comments, setComments] = useState<CommentWithVotes[]>([]);

	const { data, isLoading } = useComments(postId, {
		page: currentPage,
		take: COMMENTS_TAKE,
		depth: 3,
		sort: commentSortOption,
		skip: (currentPage - 1) * COMMENTS_TAKE,
	});

	const totalComments = data?.pagination?.totalCount || 0;
	const totalPages = data?.pagination?.totalPages || 0;

	useEffect(() => {
		setComments(data?.comments || []);
	}, [data]);

	const addComment = (comment: CommentWithVotes) => {
		setComments((prev) => [comment, ...prev]);
	};

	return (
		<CommentContext.Provider
			value={{
				comments,
				totalComments,
				isLoading,
				currentPage,
				commentSortOption,
				setCurrentPage,
				setCommentSortOption,
				addComment,
				postId,
				totalPages,
			}}
		>
			{children}
		</CommentContext.Provider>
	);
};
