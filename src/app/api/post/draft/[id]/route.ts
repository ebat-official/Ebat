import { db } from "@/db";
import { NextResponse } from "next/server";
import { PostStatus, PostApprovalStatus } from "@/db/schema/enums";
import {
	ID_NOT_EXIST_ERROR,
	POST_NOT_EXIST_ERROR,
	LIVE_POST_EDIT_ERROR,
	UNAUTHENTICATED_ERROR,
	UNAUTHORIZED_ERROR,
} from "@/utils/errors";
import { getPostById } from "@/utils/api utils/posts";
import { getCurrentUser } from "@/actions/user";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		if (!id) {
			return NextResponse.json(ID_NOT_EXIST_ERROR, { status: 404 });
		}

		const post = await getPostById(id);

		if (!post) {
			return NextResponse.json(POST_NOT_EXIST_ERROR, { status: 404 });
		}

		const isLivePost = post.approvalStatus === PostApprovalStatus.APPROVED;

		if (isLivePost) {
			return NextResponse.json(LIVE_POST_EDIT_ERROR, { status: 403 });
		}

		// Authorization: Only the author can see Draft/Not Live posts
		const user = await getCurrentUser();

		if (!user) {
			return NextResponse.json(UNAUTHENTICATED_ERROR, { status: 401 });
		}

		const isOwner = post.authorId === user.id;
		if (!isOwner) {
			return NextResponse.json(UNAUTHORIZED_ERROR, { status: 403 });
		}

		return NextResponse.json(post, { status: 200 });
	} catch (error) {
		console.error("Error fetching post:", error);
		return NextResponse.json(
			{ error: "Failed to fetch post" },
			{ status: 500 },
		);
	}
}
