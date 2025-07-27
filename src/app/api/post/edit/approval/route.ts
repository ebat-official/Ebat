import { getCurrentUser } from "@/actions/user";
import { db } from "@/db";
import { postEdits } from "@/db/schema";
import {
	PostApprovalStatus,
	PostStatus,
	PostType,
	PostCategory,
	SubCategory,
	Difficulty,
} from "@/db/schema/enums";
import { and, desc, eq, asc, Column, ilike, ne, count } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const POST_EDIT_SORT_FIELDS = [
	"createdAt",
	"updatedAt",
	"title",
	"category",
	"subCategory",
	"type",
	"difficulty",
	"approvalStatus",
] as const;

type PostEditSortField = (typeof POST_EDIT_SORT_FIELDS)[number];

const postEditSortColumns: Record<PostEditSortField, Column> = {
	createdAt: postEdits.createdAt,
	updatedAt: postEdits.updatedAt,
	title: postEdits.title,
	category: postEdits.category,
	subCategory: postEdits.subCategory,
	type: postEdits.type,
	difficulty: postEdits.difficulty,
	approvalStatus: postEdits.approvalStatus,
};

export async function GET(request: NextRequest) {
	try {
		const currentUser = await getCurrentUser();
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const sortField =
			(searchParams.get("sortField") as PostEditSortField) || "createdAt";
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

		// Build where conditions for post edits
		const editConditions = [
			eq(postEdits.approvalStatus, PostApprovalStatus.PENDING),
			eq(postEdits.status, PostStatus.PUBLISHED),
			// Exclude current user's post edits - show only other users' edits
			ne(postEdits.authorId, currentUser.id),
		];
		if (search) {
			editConditions.push(ilike(postEdits.title, `%${search}%`));
		}
		if (category) {
			editConditions.push(eq(postEdits.category, category as PostCategory));
		}
		if (subcategory) {
			editConditions.push(
				eq(postEdits.subCategory, subcategory as SubCategory),
			);
		}
		if (type) {
			editConditions.push(eq(postEdits.type, type as PostType));
		}
		if (difficulty) {
			editConditions.push(eq(postEdits.difficulty, difficulty as Difficulty));
		}
		if (companies && companies.length > 0) {
			editConditions.push(ilike(postEdits.companies, `%${companies[0]}%`));
		}
		if (topics && topics.length > 0) {
			editConditions.push(ilike(postEdits.topics, `%${topics[0]}%`));
		}

		const editSort = postEditSortColumns[sortField]
			? sortOrder === "asc"
				? asc(postEditSortColumns[sortField])
				: desc(postEditSortColumns[sortField])
			: desc(postEdits.createdAt);

		// Get total count for pagination
		const editsCountResult = await db
			.select({ count: count() })
			.from(postEdits)
			.where(and(...editConditions));

		const totalEdits = Number(editsCountResult[0]?.count || 0);

		const pendingPostEdits = await db.query.postEdits.findMany({
			where: and(...editConditions),
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
			orderBy: [editSort],
			limit: pageSize,
			offset,
		});

		return NextResponse.json({
			postEdits: pendingPostEdits,
			pagination: {
				page,
				pageSize,
				totalEdits,
				totalPages: Math.ceil(totalEdits / pageSize),
			},
		});
	} catch (error) {
		console.error("Error fetching pending post edits:", error);
		return NextResponse.json(
			{ error: "Failed to fetch pending post edits" },
			{ status: 500 },
		);
	}
}
