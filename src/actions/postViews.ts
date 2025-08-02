"use server";
import { db } from "@/db";
import { postViews } from "@/db/schema";
import { sql } from "drizzle-orm";
import { rateLimit, ApiActions, RateLimitCategory } from "@/lib/rateLimit";

/**
 * Increment the view count for a post by a given number.
 * If the PostView row does not exist, it will be created.
 * @param postId - The ID of the post
 * @param incrementBy - The number to add to the current view count
 */
export async function incrementPostView(postId: string, incrementBy = 1) {
	// Rate limiting for view tracking
	const rateLimitResult = await rateLimit(
		RateLimitCategory.API,
		ApiActions.POSTS,
	);
	if (!rateLimitResult.success) {
		return; // Silently fail for view tracking
	}

	if (!postId || incrementBy <= 0) return;

	await db
		.insert(postViews)
		.values({ postId, count: incrementBy })
		.onConflictDoUpdate({
			target: postViews.postId,
			set: { count: sql`${postViews.count} + ${incrementBy}` },
		});
}
