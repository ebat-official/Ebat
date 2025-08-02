import { getCurrentUser } from "@/actions/user";
import { db } from "@/db";
import { bookmarks } from "@/db/schema";
import { posts } from "@/db/schema";
import { user } from "@/db/schema/auth";
import {
	PostCategory,
	PostType,
	SubCategory,
	Difficulty,
} from "@/db/schema/enums";
import { and, eq, desc, asc, Column, ilike, count } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, ApiActions, RateLimitCategory } from "@/lib/rateLimit";

const BOOKMARK_SORT_FIELDS = [
	"createdAt",
	"title",
	"category",
	"subcategory",
	"type",
	"difficulty",
] as const;

type BookmarkSortField = (typeof BOOKMARK_SORT_FIELDS)[number];

const bookmarkSortColumns: Record<BookmarkSortField, Column> = {
	createdAt: bookmarks.createdAt,
	title: posts.title,
	category: posts.category,
	subcategory: posts.subCategory,
	type: posts.type,
	difficulty: posts.difficulty,
};

// Helper function to validate enum values
function isValidEnumValue<T extends Record<string, string>>(
	enumObj: T,
	value: string,
): value is T[keyof T] {
	return Object.values(enumObj).includes(value as T[keyof T]);
}

export async function GET(request: NextRequest) {
	// Rate limiting
	const rateLimitCheck = await checkRateLimit(
		RateLimitCategory.API,
		ApiActions.POSTS,
	);
	if (!rateLimitCheck.success) {
		return NextResponse.json({ error: rateLimitCheck.error }, { status: 429 });
	}

	try {
		const currentUser = await getCurrentUser();
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const sortFieldParam = searchParams.get("sortField");
		const sortField = (
			BOOKMARK_SORT_FIELDS.includes(sortFieldParam as BookmarkSortField)
				? sortFieldParam
				: "createdAt"
		) as BookmarkSortField;
		const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
		const search = searchParams.get("search") || "";
		const category = searchParams.get("category");
		const subcategory = searchParams.get("subcategory");
		const type = searchParams.get("type");
		const difficulty = searchParams.get("difficulty");

		// Pagination parameters
		const page = Number.parseInt(searchParams.get("page") || "1");
		const pageSize = Number.parseInt(searchParams.get("pageSize") || "10");
		const offset = (page - 1) * pageSize;

		// Build where conditions for bookmarks
		const bookmarkConditions = [eq(bookmarks.userId, currentUser.id)];

		// Add search condition if provided
		if (search) {
			bookmarkConditions.push(ilike(posts.title, `%${search}%`));
		}

		// Add filter conditions with proper validation
		if (category && isValidEnumValue(PostCategory, category)) {
			bookmarkConditions.push(eq(posts.category, category as PostCategory));
		}
		if (subcategory && isValidEnumValue(SubCategory, subcategory)) {
			bookmarkConditions.push(
				eq(posts.subCategory, subcategory as SubCategory),
			);
		}
		if (type && isValidEnumValue(PostType, type)) {
			bookmarkConditions.push(eq(posts.type, type as PostType));
		}
		if (difficulty && isValidEnumValue(Difficulty, difficulty)) {
			bookmarkConditions.push(eq(posts.difficulty, difficulty as Difficulty));
		}

		// Determine sort order
		const bookmarkSort = bookmarkSortColumns[sortField]
			? sortOrder === "asc"
				? asc(bookmarkSortColumns[sortField])
				: desc(bookmarkSortColumns[sortField])
			: desc(bookmarks.createdAt);

		// Get total count for pagination
		const bookmarksCountResult = await db
			.select({ count: count() })
			.from(bookmarks)
			.innerJoin(posts, eq(bookmarks.postId, posts.id))
			.where(and(...bookmarkConditions));

		const totalBookmarks = Number(bookmarksCountResult[0]?.count || 0);

		// Get bookmarks with post and author details using explicit joins
		const bookmarksWithDetails = await db
			.select({
				bookmark: {
					id: bookmarks.id,
					userId: bookmarks.userId,
					postId: bookmarks.postId,
					createdAt: bookmarks.createdAt,
				},
				post: {
					id: posts.id,
					title: posts.title,
					slug: posts.slug,
					category: posts.category,
					subCategory: posts.subCategory,
					type: posts.type,
					difficulty: posts.difficulty,
				},
				author: {
					id: user.id,
					name: user.name,
					username: user.username,
				},
			})
			.from(bookmarks)
			.innerJoin(posts, eq(bookmarks.postId, posts.id))
			.innerJoin(user, eq(posts.authorId, user.id))
			.where(and(...bookmarkConditions))
			.orderBy(bookmarkSort)
			.limit(pageSize)
			.offset(offset);

		// Transform the result to match the expected format
		const transformedBookmarks = bookmarksWithDetails.map((item) => ({
			...item.bookmark,
			post: {
				...item.post,
				author: item.author,
			},
		}));

		return NextResponse.json({
			bookmarks: transformedBookmarks,
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
