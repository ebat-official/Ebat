import { create } from "zustand";
import { fetchCompletionStatuses } from "@/utils/api utils/apiUtils";
import { CompletionStatus } from "@/db/schema/zod-schemas";
import {
	createCompletionStatus,
	deleteCompletionStatus,
} from "@/actions/completionStatus";

interface CompletionStatusState {
	// Cache of completion statuses by postId
	statuses: Record<string, CompletionStatus>;
	// Track which postIds are being fetched to avoid duplicate requests
	isLoading: Set<string>;
	// Track which postIds have been requested but not yet fetched
	pending: Set<string>;

	// Actions
	getCompletionStatus: (postId: string) => CompletionStatus | null;
	getCompletionStatuses: (postIds: string[]) => CompletionStatus[];
	fetchCompletionStatuses: (postIds: string[]) => Promise<void>;
	updateCompletionStatus: (postId: string, completed: boolean) => Promise<void>;
	clearCache: () => void;
}

export const useCompletionStatusStore = create<CompletionStatusState>(
	(set, get) => ({
		statuses: {},
		isLoading: new Set(),
		pending: new Set(),

		// Get a single completion status from cache
		getCompletionStatus: (postId: string) => {
			return get().statuses[postId] || null;
		},

		// Get multiple completion statuses from cache
		getCompletionStatuses: (postIds: string[]) => {
			const { statuses } = get();
			return postIds
				.map((postId) => statuses[postId])
				.filter((status): status is CompletionStatus => status !== undefined);
		},

		// Fetch completion statuses for given postIds
		fetchCompletionStatuses: async (postIds: string[]) => {
			const { statuses, isLoading, pending } = get();

			// Filter out postIds that are already cached or being fetched
			const uncachedIds = postIds.filter(
				(id) => !statuses[id] && !isLoading.has(id),
			);

			if (uncachedIds.length === 0) return;

			// Mark these IDs as being fetched
			set((state) => ({
				isLoading: new Set([...state.isLoading, ...uncachedIds]),
				pending: new Set([...state.pending, ...uncachedIds]),
			}));

			try {
				const fetchedStatuses = await fetchCompletionStatuses(uncachedIds);

				// Update cache with fetched statuses
				const newStatuses = { ...statuses };
				for (const status of fetchedStatuses) {
					newStatuses[status.postId] = status;
				}

				set((state) => ({
					statuses: newStatuses,
					isLoading: new Set(
						Array.from(state.isLoading).filter(
							(id) => !uncachedIds.includes(id),
						),
					),
					pending: new Set(
						Array.from(state.pending).filter((id) => !uncachedIds.includes(id)),
					),
				}));
			} catch (error) {
				// Remove from loading on error
				set((state) => ({
					isLoading: new Set(
						Array.from(state.isLoading).filter(
							(id) => !uncachedIds.includes(id),
						),
					),
					pending: new Set(
						Array.from(state.pending).filter((id) => !uncachedIds.includes(id)),
					),
				}));
				console.error("Failed to fetch completion statuses:", error);
			}
		},

		// Update completion status (optimistic update)
		updateCompletionStatus: async (postId: string, completed: boolean) => {
			const { statuses } = get();

			// Mark as loading
			set((state) => ({
				isLoading: new Set([...state.isLoading, postId]),
			}));

			// Optimistic update
			if (completed) {
				// Create a new completion status
				const newStatus: CompletionStatus = {
					id: crypto.randomUUID(), // Temporary ID
					userId: "", // Will be set by server
					postId,
					completedAt: new Date(),
				};

				set((state) => ({
					statuses: { ...state.statuses, [postId]: newStatus },
				}));
			} else {
				// Remove from cache
				set((state) => {
					const newStatuses = { ...state.statuses };
					delete newStatuses[postId];
					return { statuses: newStatuses };
				});
			}

			try {
				// Call server action
				if (completed) {
					const serverStatus = await createCompletionStatus(postId);
					// Update with server response
					set((state) => ({
						statuses: { ...state.statuses, [postId]: serverStatus },
					}));
				} else {
					await deleteCompletionStatus(postId);
				}

				// Remove from loading on success
				set((state) => ({
					isLoading: new Set(
						Array.from(state.isLoading).filter((id) => id !== postId),
					),
				}));
			} catch (error) {
				// Revert optimistic update on error
				if (completed) {
					set((state) => {
						const newStatuses = { ...state.statuses };
						delete newStatuses[postId];
						return { statuses: newStatuses };
					});
				} else {
					// Re-add the status that was removed
					const originalStatus = statuses[postId];
					if (originalStatus) {
						set((state) => ({
							statuses: { ...state.statuses, [postId]: originalStatus },
						}));
					}
				}

				// Remove from loading on error
				set((state) => ({
					isLoading: new Set(
						Array.from(state.isLoading).filter((id) => id !== postId),
					),
				}));

				console.error("Failed to update completion status:", error);
				throw error;
			}
		},

		// Clear the cache
		clearCache: () => {
			set({ statuses: {}, isLoading: new Set(), pending: new Set() });
		},
	}),
);
