"use client";
import { bookmarkAction, checkBookmarkStatus } from "@/actions/bookmark";
import { BOOKMARK_ACTIONS } from "@/utils/constants";
import { useState, useEffect, useCallback } from "react";

export function useBookmark(postId: string) {
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isUpdating, setIsUpdating] = useState(false);

	// Check initial bookmark status
	useEffect(() => {
		const checkStatus = async () => {
			try {
				const status = await checkBookmarkStatus(postId);
				setIsBookmarked(status);
			} catch (error) {
				console.error("Failed to check bookmark status:", error);
			} finally {
				setIsLoading(false);
			}
		};

		checkStatus();
	}, [postId]);

	// Toggle bookmark
	const toggleBookmark = useCallback(async () => {
		if (isUpdating) return;

		setIsUpdating(true);
		const newStatus = !isBookmarked;

		// Optimistic update
		setIsBookmarked(newStatus);

		try {
			const action = newStatus ? BOOKMARK_ACTIONS.ADD : BOOKMARK_ACTIONS.REMOVE;
			const result = await bookmarkAction({ postId, action });

			if (result.status === "error") {
				// Revert optimistic update on error
				setIsBookmarked(!newStatus);
				console.error("Bookmark action failed:", result.data);
			}
		} catch (error) {
			// Revert optimistic update on error
			setIsBookmarked(!newStatus);
			console.error("Bookmark action failed:", error);
		} finally {
			setIsUpdating(false);
		}
	}, [postId, isBookmarked, isUpdating]);

	return {
		isBookmarked,
		isLoading,
		isUpdating,
		toggleBookmark,
	};
}
