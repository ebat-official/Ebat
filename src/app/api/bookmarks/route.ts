import { getCurrentUser } from "@/actions/user";
import { db } from "@/db";
import { bookmarks } from "@/db/schema";
import { posts } from "@/db/schema";
import { user } from "@/db/schema/auth";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const currentUser = await getCurrentUser();
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const search = searchParams.get("search") || "";
		const category = searchParams.get("category");
		const subcategory = searchParams.get("subcategory");
		const type = searchParams.get("type");
		const difficulty = searchParams.get("difficulty");

		// Pagination parameters
		const page = Number.parseInt(searchParams.get("page") || "1");
		const pageSize = Number.parseInt(searchParams.get("pageSize") || "10");
		const offset = (page - 1) * pageSize;

		// Get user bookmarks
		const userBookmarks = await db
			.select({
				id: bookmarks.id,
				postId: bookmarks.postId,
				createdAt: bookmarks.id,
			})
			.from(bookmarks)
			.where(eq(bookmarks.userId, currentUser.id));

		// Get post details for each bookmark
		const bookmarksWithDetails = await Promise.all(
			userBookmarks.map(async (bookmark) => {
				const post = await db
					.select({
						title: posts.title,
						category: posts.category,
						subcategory: posts.subCategory,
						type: posts.type,
						difficulty: posts.difficulty,
						coins: posts.coins,
						authorId: posts.authorId,
					})
					.from(posts)
					.where(eq(posts.id, bookmark.postId))
					.limit(1);

				if (post.length === 0) {
					return {
						...bookmark,
						title: "Post not found",
						category: null,
						subcategory: null,
						type: null,
						difficulty: null,
						coins: 0,
						authorName: "Unknown",
					};
				}

				const postData = post[0];
				
				// Get author name
				const author = await db
					.select({ name: user.name })
					.from(user)
					.where(eq(user.id, postData.authorId))
					.limit(1);

				return {
					...bookmark,
					...postData,
					authorName: author.length > 0 ? author[0].name : "Unknown",
				};
			})
		);

		// Apply filters
		let filteredBookmarks = bookmarksWithDetails.filter((bookmark) => {
			const matchesSearch = 
				bookmark.title?.toLowerCase().includes(search.toLowerCase()) ||
				bookmark.authorName?.toLowerCase().includes(search.toLowerCase());
			
			const matchesCategory = !category || bookmark.category === category;
			const matchesSubcategory = !subcategory || bookmark.subcategory === subcategory;
			const matchesType = !type || bookmark.type === type;
			const matchesDifficulty = !difficulty || bookmark.difficulty === difficulty;

			return matchesSearch && matchesCategory && matchesSubcategory && matchesType && matchesDifficulty;
		});

		// Apply pagination
		const totalBookmarks = filteredBookmarks.length;
		const paginatedBookmarks = filteredBookmarks.slice(offset, offset + pageSize);

		return NextResponse.json({
			bookmarks: paginatedBookmarks,
			pagination: {
				page,
				pageSize,
				totalBookmarks,
				totalPages: Math.ceil(totalBookmarks / pageSize),
			},
		});
	} catch (error) {
		console.error("Error fetching bookmarks:", error);
		return NextResponse.json(
			{ error: "Failed to fetch bookmarks" },
			{ status: 500 },
		);
	}
} 