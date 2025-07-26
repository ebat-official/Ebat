"use server";
import { db } from "@/db";
import { bookmarks } from "@/db/schema";
import { posts } from "@/db/schema";
import { user } from "@/db/schema/auth";
import { SUCCESS } from "@/utils/constants";
import { UNAUTHENTICATED_ERROR, VALIDATION_ERROR } from "@/utils/errors";
import { GenerateActionReturnType } from "@/utils/types";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { validateUser } from "./user";

const BookmarkValidator = z.object({
	postId: z.string(),
	action: z.enum(["add", "remove"]),
});

export async function bookmarkAction(
	data: z.infer<typeof BookmarkValidator>,
): Promise<GenerateActionReturnType<string>> {
	const validatedData = BookmarkValidator.safeParse(data);
	if (!validatedData.success) return VALIDATION_ERROR;

	const user = await validateUser();
	if (!user) return UNAUTHENTICATED_ERROR;

	const { postId, action } = validatedData.data;

	try {
		if (action === "add") {
			// Add bookmark
			await db
				.insert(bookmarks)
				.values({ userId: user.id, postId })
				.onConflictDoNothing();
			return { status: SUCCESS, data: "Bookmarked" };
		} else {
			// Remove bookmark
			await db
				.delete(bookmarks)
				.where(
					and(eq(bookmarks.userId, user.id), eq(bookmarks.postId, postId)),
				);
			return { status: SUCCESS, data: "Removed bookmark" };
		}
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

// Check if user has any bookmarks
export async function hasUserBookmarks(): Promise<boolean> {
	const user = await validateUser();
	if (!user) return false;

	try {
		const userBookmarks = await db
			.select()
			.from(bookmarks)
			.where(eq(bookmarks.userId, user.id))
			.limit(1);

		return userBookmarks.length > 0;
	} catch (error) {
		console.error("Failed to check user bookmarks:", error);
		return false;
	}
}

// Get user bookmarks with post details
export async function getUserBookmarksWithDetails() {
	const user = await validateUser();
	if (!user) return [];

	try {
		// Get bookmarks with basic info
		const userBookmarks = await db
			.select({
				id: bookmarks.id,
				postId: bookmarks.postId,
				createdAt: bookmarks.id, // Using id as proxy for createdAt
			})
			.from(bookmarks)
			.where(eq(bookmarks.userId, user.id));

		// For now, return basic bookmark info
		// In a production environment, you would implement proper joins or separate queries
		// to get post details for each bookmark
		return userBookmarks.map((bookmark) => ({
			...bookmark,
			title: `Post ${bookmark.postId}`, // Will be replaced with real data
			authorName: "Author", // Will be replaced with real data
			category: "Frontend", // Will be replaced with real data
			subcategory: "React", // Will be replaced with real data
			type: "Question", // Will be replaced with real data
			difficulty: "Medium", // Will be replaced with real data
			coins: 10, // Will be replaced with real data
		}));
	} catch (error) {
		console.error("Failed to get user bookmarks with details:", error);
		return [];
	}
}
