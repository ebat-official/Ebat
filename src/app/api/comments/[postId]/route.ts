import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { getCommentsWithVotes } from "@/utils/api utils/comment";
import { CommentSortOption } from "@/utils/types";
import { redis } from "@/lib/redis";
import { COMMENT_SORT_OPTIONS } from "@/utils/contants";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ postId: string }> },
) {
	try {
		const { postId } = await params;
		if (!postId) {
			return NextResponse.json({ error: "Missing postId" }, { status: 400 });
		}

		const { searchParams } = new URL(request.url);

		// Parse query parameters with defaults
		const sort = searchParams.get("sort") ?? COMMENT_SORT_OPTIONS.TOP;
		const take = Number.parseInt(searchParams.get("take") ?? "10");
		const skip = Number.parseInt(searchParams.get("skip") ?? "0");
		const depth = Number.parseInt(searchParams.get("depth") ?? "1");
		const replyTake = Number.parseInt(searchParams.get("replyTake") ?? "5");
		const replySkip = Number.parseInt(searchParams.get("replySkip") ?? "0");
		const currentPage = Number.parseInt(searchParams.get("page") ?? "1");
		const minScore = Number.parseInt(searchParams.get("minScore") ?? "0");
		const includeAuthor = searchParams.get("includeAuthor") !== "false";
		const includeVotes = searchParams.get("includeVotes") !== "false";
		const parentId = searchParams.get("parentId");

		const cacheKey = `comments:${postId}:p:${currentPage}:s:${sort}`;
		const shouldCache = currentPage === 1 && skip === 0;

		// Try cache first for first page
		if (shouldCache) {
			try {
				const cached = await redis.get(cacheKey);
				if (cached) {
					return NextResponse.json(cached, {
						status: 200,
						headers: {
							"X-Cache": "HIT",
							"Cache-Control": "public, max-age=120",
							"Content-Type": "application/json",
						},
					});
				}
			} catch (err) {
				console.error("Redis cache error, falling back to DB:", err);
			}
		}

		// Fetch from DB
		const data = await getCommentsWithVotes(postId, parentId, {
			sort: sort as CommentSortOption,
			take,
			skip,
			depth,
			replyTake,
			replySkip,
			currentPage,
			minScore,
			includeAuthor,
			includeVotes,
		});

		// Cache if first page
		if (shouldCache) {
			try {
				await redis.set(cacheKey, data);
			} catch (err) {
				console.error("Redis setex error — skipping cache:", err);
			}
		}

		if (shouldCache) {
			return NextResponse.json(data, {
				status: 200,
				headers: {
					"Cache-Control": "public, max-age=120",
					"Content-Type": "application/json",
				},
			});
		}

		return NextResponse.json(data, {
			status: 200,
			headers: {
				"Cache-Control": "public, max-age=60",
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		console.error("Error fetching comments:", error);
		return NextResponse.json(
			{ error: "Failed to fetch comments." },
			{ status: 500 },
		);
	}
}
