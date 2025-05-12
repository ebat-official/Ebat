import { searchPosts } from "@/utils/api utils/posts";
import { Difficulty, PostCategory, SubCategory } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		// Extract query parameters using `request.nextUrl.searchParams`
		const searchParams = request.nextUrl.searchParams;
		const searchQuery = decodeURIComponent(
			searchParams.get("searchQuery") || "",
		); // Default to an empty string
		const difficulty = searchParams.getAll("difficulty") as Difficulty[]; // Array of difficulties
		const topics = searchParams.getAll("topics"); // Array of topics
		const category =
			(searchParams.get("category") as PostCategory) || undefined; // Optional category
		const subCategory =
			(searchParams.get("subCategory") as SubCategory) || undefined; // Optional subcategory
		const page = parseInt(searchParams.get("page") || "1", 10); // Default to page 1
		const pageSize = parseInt(searchParams.get("pageSize") || "10", 10); // Default to page size 10

		// Perform search using the custom search function
		const posts = await searchPosts({
			searchQuery,
			difficulty,
			topics,
			category,
			subCategory,
			page,
			pageSize,
		});

		if (posts.length === 0) {
			return NextResponse.json(
				{ message: "No posts found matching the query" },
				{ status: 404 },
			);
		}

		return NextResponse.json(
			{ posts },
			{
				status: 200,
				headers: {
					"Cache-Control": "public, max-age=10",
					"Content-Type": "application/json",
				},
			},
		);
	} catch (error) {
		console.error("Error fetching posts:", error);
		return NextResponse.json(
			{ error: "Failed to fetch posts." },
			{ status: 500 },
		);
	}
}
