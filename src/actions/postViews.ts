"use server";
import prisma from "@/lib/prisma";

/**
 * Increment the view count for a post by a given number.
 * If the PostView row does not exist, it will be created.
 * @param postId - The ID of the post
 * @param incrementBy - The number to add to the current view count
 */
export async function incrementPostView(
	postId: string,
	incrementBy: number = 1,
) {
	if (!postId || incrementBy <= 0) return;

	await prisma.postViews.upsert({
		where: { postId },
		update: { count: { increment: incrementBy } },
		create: { postId, count: incrementBy },
	});
}
