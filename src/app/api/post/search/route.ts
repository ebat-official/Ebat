import {
	Difficulty,
	PostCategory,
	PostType,
	SubCategory,
} from "@/db/schema/enums";
import { redis } from "@/lib/redis";
import { searchPosts } from "@/utils/api utils/posts";
import { PostSortOrder } from "@/utils/types";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, ApiActions, RateLimitCategory } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
	// Rate limiting
	const rateLimitCheck = await checkRateLimit(
		RateLimitCategory.API,
		ApiActions.SEARCH,
	);
	if (!rateLimitCheck.success) {
		return NextResponse.json({ error: rateLimitCheck.error }, { status: 429 });
	}

	try {
		const searchParams = request.nextUrl.searchParams;
		const searchQuery = decodeURIComponent(
			searchParams.get("searchQuery") || "",
		);
		const difficulty = (searchParams.getAll("difficulty") || []).map((d) =>
			d.toLowerCase(),
		) as Difficulty[];
		const topics = searchParams.getAll("topics") || [];
		const category =
			(searchParams.get("category")?.toLowerCase() as PostCategory) ||
			undefined;
		const subCategory =
			(searchParams.get("subCategory")?.toLowerCase() as SubCategory) ||
			undefined;
		const page = Number.parseInt(searchParams.get("page") || "1", 10);
		const pageSize = Number.parseInt(searchParams.get("pageSize") || "10", 10);
		const sortOrder = searchParams.get("sortOrder") as PostSortOrder;
		const companies = searchParams.getAll("companies") || [];
		const type = searchParams.get("type")?.toLowerCase() as PostType;

		// Build a unique cache key for all query params
		const cacheKey = `posts:search:${searchQuery}:difficulty:${difficulty.join(",")}:topics:${topics.join(",")}:category:${category ?? "none"}:subCategory:${subCategory ?? "none"}:type:${type ?? "none"}:companies:${companies.join(",")}:page:${page}:pageSize:${pageSize}:sortOrder:${sortOrder ?? "latest"}`;

		const CACHE_SECONDS = 60 * 60 * 12; // 12 hours

		// Try cache for all queries
		try {
			const cached = await redis.get(cacheKey);
			if (cached) {
				return NextResponse.json(cached, {
					status: 200,
					headers: {
						"X-Cache": "HIT",
						"Cache-Control": `public, max-age=${CACHE_SECONDS}`,
						"Content-Type": "application/json",
					},
				});
			}
		} catch (err) {
			console.error("Redis cache error, falling back to DB:", err);
		}

		// Perform search using the custom search function
		const searchParamsObj = {
			searchQuery,
			difficulty,
			topics,
			category,
			subCategory,
			page,
			pageSize,
			sortOrder,
			companies,
			type,
		};
		const { posts, hasMore, totalPages } = await searchPosts(searchParamsObj);

		const responseData = {
			posts,
			context: {
				hasMorePage: hasMore,
				totalPages: totalPages,
				page, // current page
			},
		};

		// Cache the result for 1 day
		try {
			if (posts.length) {
				redis.set(cacheKey, JSON.stringify(responseData), {
					ex: CACHE_SECONDS,
				});
			}
		} catch (err) {
			console.error("Redis setex error — skipping cache:", err);
		}

		return NextResponse.json(responseData, {
			status: 200,
			headers: {
				"Cache-Control": `public, max-age=${CACHE_SECONDS}`,
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		console.error("Error fetching posts:", error);
		return NextResponse.json(
			{ error: "Failed to fetch posts." },
			{ status: 500 },
		);
	}
}
