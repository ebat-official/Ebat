import { useEffect } from "react";
import { useCompletionStatusStore } from "@/store/useCompletionStatusStore";

// Hook for managing completion statuses
export function useCompletionStatus(postIds?: string[]) {
	const {
		statuses,
		isLoading,
		pending,
		getCompletionStatus,
		getCompletionStatuses,
		fetchCompletionStatuses,
		updateCompletionStatus,
		clearCache,
	} = useCompletionStatusStore();

	// Auto-fetch completion statuses when postIds change
	useEffect(() => {
		if (postIds && postIds.length > 0) {
			fetchCompletionStatuses(postIds);
		}
	}, [postIds, fetchCompletionStatuses]);

	// Helper function to check if a post is completed
	const isCompleted = (postId: string) => {
		return !!statuses[postId];
	};

	// Helper function to get completion status for multiple posts
	const getCompletionStatusesForIds = (ids: string[]) => {
		return ids.map((id) => statuses[id]).filter(Boolean);
	};

	// Helper function to check if any postIds are being fetched
	const isAnyLoading = postIds
		? postIds.some((id) => isLoading.has(id))
		: false;

	return {
		// State
		statuses,
		isLoading: isAnyLoading,
		pending: Array.from(pending),

		// Actions
		getCompletionStatus,
		getCompletionStatuses,
		fetchCompletionStatuses,
		updateCompletionStatus,
		clearCache,

		// Helpers
		isCompleted,
		getCompletionStatusesForIds,
	};
}
