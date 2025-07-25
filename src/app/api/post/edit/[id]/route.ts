import { getCurrentUser } from "@/actions/user";
import { auth } from "@/auth";
import { db } from "@/db";
import { PostApprovalStatus, PostStatus } from "@/db/schema/enums";
import { getEditPostByPostId, getPostById } from "@/utils/api utils/posts";
import {
	ID_NOT_EXIST_ERROR,
	LIVE_POST_EDIT_ERROR,
	POST_NOT_EXIST_ERROR,
	UNAUTHENTICATED_ERROR,
	UNAUTHORIZED_ERROR,
} from "@/utils/errors";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		if (!id) {
			return NextResponse.json(ID_NOT_EXIST_ERROR, { status: 404 });
		}

		// Get the current user
		const user = await getCurrentUser();

		if (!user) {
			return NextResponse.json(UNAUTHENTICATED_ERROR, { status: 401 });
		}

		// Check for userid query parameter
		const { searchParams } = new URL(request.url);
		const queryUserId = searchParams.get("userid");

		// Use query userid if present, otherwise use current user's id
		const effectiveUserId = queryUserId || user.id;

		const post = await getEditPostByPostId(id, effectiveUserId);

		if (!post) {
			return NextResponse.json(POST_NOT_EXIST_ERROR, { status: 404 });
		}

		// Check if the effective user is the owner of the post
		const isOwner = post.authorId === user.id;

		// If not the owner, check if user has "edit-edit" permission
		if (!isOwner) {
			const hasEditReadPermission = await auth.api.userHasPermission({
				body: {
					userId: user.id,
					permission: { post: ["edit-edit"] },
				},
			});
			if (!hasEditReadPermission?.success) {
				return NextResponse.json(UNAUTHORIZED_ERROR, { status: 403 });
			}
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
