"use server";
import { db } from "@/db";
import { bookmarks } from "@/db/schema";
import { posts } from "@/db/schema";
import { user } from "@/db/schema/auth";
import { SUCCESS, BOOKMARK_ACTIONS } from "@/utils/constants";
import { UNAUTHENTICATED_ERROR, VALIDATION_ERROR } from "@/utils/errors";
import { GenerateActionReturnType } from "@/utils/types";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { validateUser } from "./user";
import {
	rateLimit,
	InteractionActions,
	RateLimitCategory,
} from "@/lib/rateLimit";

const BookmarkValidator = z.object({
	postId: z.string(),
	action: z.enum([BOOKMARK_ACTIONS.ADD, BOOKMARK_ACTIONS.REMOVE]),
});

export async function bookmarkAction(
	data: z.infer<typeof BookmarkValidator>,
): Promise<GenerateActionReturnType<string>> {
	// Rate limiting
	const rateLimitResult = await rateLimit(
		RateLimitCategory.INTERACTIONS,
		InteractionActions.BOOKMARK,
	);
	if (!rateLimitResult.success) {
		return {
			status: "ERROR",
			data: { message: "Rate limit exceeded. Please try again later." },
		};
	}

	const validatedData = BookmarkValidator.safeParse(data);
	if (!validatedData.success) return VALIDATION_ERROR;

	const user = await validateUser();
	if (!user) return UNAUTHENTICATED_ERROR;

	const { postId, action } = validatedData.data;

	try {
		if (action === BOOKMARK_ACTIONS.ADD) {
			// Add bookmark
			await db
				.insert(bookmarks)
				.values({ userId: user.id, postId })
				.onConflictDoNothing();
			return { status: SUCCESS, data: "Bookmarked" };
		}

		// Remove bookmark
		await db
			.delete(bookmarks)
			.where(and(eq(bookmarks.userId, user.id), eq(bookmarks.postId, postId)));
		return { status: SUCCESS, data: "Removed bookmark" };
	} catch (error) {
		console.error("Bookmark action failed:", error);
		return {
			status: "error",
			data: { message: "Failed to update bookmark" },
		};
	}
}

// Check if a post is bookmarked by the current user
export async function checkBookmarkStatus(postId: string): Promise<boolean> {
	const user = await validateUser();
	if (!user) return false;

	try {
		const bookmark = await db
			.select()
			.from(bookmarks)
			.where(and(eq(bookmarks.userId, user.id), eq(bookmarks.postId, postId)))
			.limit(1);

		return bookmark.length > 0;
	} catch (error) {
		console.error("Failed to check bookmark status:", error);
		return false;
	}
}
