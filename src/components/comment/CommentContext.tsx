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
	addComment: (comment: CommentWithVotes, parentId?: string) => void;
	postId: string;
	totalPages: number;
	deleteComment: (commentId: string) => void;
	updateComment: (commentId: string, newContent: string) => void;
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
	const [totalComments, setTotalComments] = useState(0);

	const { data, isLoading } = useComments(postId, {
		page: currentPage,
		take: COMMENTS_TAKE,
		depth: 3,
		sort: commentSortOption,
		skip: (currentPage - 1) * COMMENTS_TAKE,
	});

	const totalPages = data?.pagination?.totalPages || 0;

	useEffect(() => {
		setComments(data?.comments || []);
		setTotalComments(data?.pagination?.totalCount || 0);
	}, [data]);

	const addComment = (comment: CommentWithVotes) => {
		if (!comment.parentId) {
			// If it's a top-level comment, add it to the root level
			setComments((prev) => [comment, ...prev]);
			return;
		}

		// Recursive function to find the parent and add the comment
		const addCommentRecursive = (
			comments: CommentWithVotes[],
			parentId: string,
		): CommentWithVotes[] => {
			return comments.map((parentComment) => {
				if (parentComment.id === parentId) {
					// Found the parent, add the new comment to its replies
					return {
						...parentComment,
						replies: [comment, ...parentComment.replies], // Add the new comment to the replies
						updatedAt: new Date(), // Update the parent's updatedAt field
					};
				}

				// Recursively process the replies
				const updatedReplies = addCommentRecursive(
					parentComment.replies,
					parentId,
				);

				// If the comment is in the replies, update the parent's updatedAt
				if (updatedReplies !== parentComment.replies) {
					return {
						...parentComment,
						replies: updatedReplies,
						updatedAt: new Date(), // Update the parent's updatedAt field
					};
				}

				return parentComment; // No changes, return the original comment
			});
		};
		const updatedComments = addCommentRecursive(comments, comment.parentId);
		// Update the comments state with the new structure
		setComments(updatedComments);
	};

	const deleteCommentRecursive = (
		commentId: string,
		comments: CommentWithVotes[],
	): { updatedComments: CommentWithVotes[]; found: boolean } => {
		let found = false;

		const updatedComments = comments.filter((comment) => {
			if (comment.id === commentId) {
				found = true; // Mark as found and skip this comment
				if (!comment.parentId) {
					setTotalComments((prev) => prev - 1);
				}
				return false;
			}

			const { updatedComments: updatedReplies, found: replyFound } =
				deleteCommentRecursive(commentId, comment.replies);

			if (replyFound) {
				found = true; // Mark as found if the comment was found in replies
				comment.updatedAt = new Date(); // this is require to update the keys of rendering
			}

			comment.replies = [...updatedReplies]; // Update replies
			return true;
		});

		return { updatedComments, found };
	};

	const updateCommentRecursive = (
		commentId: string,
		newContent: string,
		comments: CommentWithVotes[],
	): { updatedComments: CommentWithVotes[]; found: boolean } => {
		let found = false;

		const updatedComments = comments.map((comment) => {
			if (comment.id === commentId) {
				found = true; // Mark as found and update the content
				return {
					...comment,
					content: newContent,
				};
			}

			// Recursively update replies
			const { updatedComments: updatedReplies, found: replyFound } =
				updateCommentRecursive(commentId, newContent, comment.replies);

			if (replyFound) {
				found = true; // Mark as found if the comment was found in replies
				return {
					...comment,
					replies: updatedReplies, // Properly update the replies array
				};
			}

			return comment; // Return the original comment if no changes
		});

		return { updatedComments, found };
	};

	const deleteComment = (commentId: string) => {
		const { updatedComments } = deleteCommentRecursive(commentId, comments);
		setComments(JSON.parse(JSON.stringify(updatedComments)));
	};

	const updateComment = (commentId: string, newContent: string) => {
		const { updatedComments } = updateCommentRecursive(
			commentId,
			newContent,
			comments,
		);
		setComments([...updatedComments]);
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
				deleteComment,
				updateComment,
			}}
		>
			{children}
		</CommentContext.Provider>
	);
};
