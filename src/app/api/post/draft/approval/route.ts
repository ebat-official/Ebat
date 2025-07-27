import { getCurrentUser } from "@/actions/user";
import { db } from "@/db";
import { posts } from "@/db/schema";
import {
	PostApprovalStatus,
	PostStatus,
	PostCategory,
	PostType,
	SubCategory,
	Difficulty,
} from "@/db/schema/enums";
import {
	and,
	desc,
	eq,
	asc,
	Column,
	ilike,
	inArray,
	ne,
	count,
} from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const POST_SORT_FIELDS = [
	"createdAt",
	"updatedAt",
	"title",
	"category",
	"subCategory",
	"type",
	"status",
	"approvalStatus",
	"difficulty",
] as const;

type PostSortField = (typeof POST_SORT_FIELDS)[number];

const postSortColumns: Record<PostSortField, Column> = {
	createdAt: posts.createdAt,
	updatedAt: posts.updatedAt,
	title: posts.title,
	category: posts.category,
	subCategory: posts.subCategory,
	type: posts.type,
	status: posts.status,
	approvalStatus: posts.approvalStatus,
	difficulty: posts.difficulty,
};

export async function GET(request: NextRequest) {
	try {
		const currentUser = await getCurrentUser();
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const sortField =
			(searchParams.get("sortField") as PostSortField) || "createdAt";
		const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
		const search = searchParams.get("search") || "";
		const category = searchParams.get("category");
		const subcategory = searchParams.get("subcategory");
		const type = searchParams.get("type");
		const difficulty = searchParams.get("difficulty");
		const companies = searchParams.get("companies")?.split(",").filter(Boolean);
		const topics = searchParams.get("topics")?.split(",").filter(Boolean);

		// Pagination parameters
		const page = Number.parseInt(searchParams.get("page") || "1");
		const pageSize = Number.parseInt(searchParams.get("pageSize") || "10");
		const offset = (page - 1) * pageSize;

		// Build where conditions for posts
		const postConditions = [
			eq(posts.status, PostStatus.PUBLISHED),
			eq(posts.approvalStatus, PostApprovalStatus.PENDING),
			// Exclude current user's posts - show only other users' posts
			ne(posts.authorId, currentUser.id),
		];
		if (search) {
			postConditions.push(ilike(posts.title, `%${search}%`));
		}
		if (category) {
			postConditions.push(eq(posts.category, category as PostCategory));
		}
		if (subcategory) {
			postConditions.push(eq(posts.subCategory, subcategory as SubCategory));
		}
		if (type) {
			postConditions.push(eq(posts.type, type as PostType));
		}
		if (difficulty) {
			postConditions.push(eq(posts.difficulty, difficulty as Difficulty));
		}
		if (companies && companies.length > 0) {
			postConditions.push(ilike(posts.companies, `%${companies[0]}%`));
		}
		if (topics && topics.length > 0) {
			postConditions.push(ilike(posts.topics, `%${topics[0]}%`));
		}

		const postSort = postSortColumns[sortField]
			? sortOrder === "asc"
				? asc(postSortColumns[sortField])
				: desc(postSortColumns[sortField])
			: desc(posts.createdAt);

		// Get total count for pagination
		const postsCountResult = await db
			.select({ count: count() })
			.from(posts)
			.where(and(...postConditions));

		const totalPosts = Number(postsCountResult[0]?.count || 0);

		const pendingPosts = await db.query.posts.findMany({
			where: and(...postConditions),
			with: {
				author: {
					columns: {
						id: true,
						name: true,
						username: true,
						email: true,
					},
				},
			},
			orderBy: [postSort],
			limit: pageSize,
			offset,
		});

		return NextResponse.json({
			posts: pendingPosts,
			pagination: {
				page,
				pageSize,
				totalPosts,
				totalPages: Math.ceil(totalPosts / pageSize),
			},
		});
	} catch (error) {
		console.error("Error fetching pending posts:", error);
		return NextResponse.json(
			{ error: "Failed to fetch pending posts" },
			{ status: 500 },
		);
	}
}
