import { getCompletionStatusesForPosts } from "@/actions/completionStatus";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const postIdsParam = searchParams.get("postIds");

		if (!postIdsParam) {
			return NextResponse.json(
				{ error: "postIds parameter is required" },
				{ status: 400 },
			);
		}

		const postIds = postIdsParam.split(",").filter(Boolean);

		if (postIds.length === 0) {
			return NextResponse.json(
				{ error: "At least one postId is required" },
				{ status: 400 },
			);
		}

		const statuses = await getCompletionStatusesForPosts(postIds);

		return NextResponse.json(statuses, { status: 200 });
	} catch (error) {
		console.error("Error fetching completion statuses:", error);
		return NextResponse.json(
			{ error: "Failed to fetch completion statuses" },
			{ status: 500 },
		);
	}
}
