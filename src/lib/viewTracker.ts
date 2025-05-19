// lib/viewTracker.ts

const inMemoryViews: Record<string, number> = {};

/**
 * Called on every post view
 */
export function recordPostView(postId: string) {
	inMemoryViews[postId] = inMemoryViews[postId] || 0;
	inMemoryViews[postId] += 1;
}

/**
 * Calling this periodically using upstash scheduler
 */
export async function flushViewsToDB(
	updateFn: (postId: string, count: number) => Promise<void>,
) {
	for (const [postId, count] of Object.entries(inMemoryViews)) {
		if (count > 0) {
			try {
				await updateFn(postId, count);
				delete inMemoryViews[postId];
			} catch (err) {
				console.error(`Failed to flush views for post ${postId}:`, err);
			}
		}
	}
}
