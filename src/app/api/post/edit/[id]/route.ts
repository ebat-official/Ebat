import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PostStatus, PostApprovalStatus } from "@prisma/client";
import {
	ID_NOT_EXIST_ERROR,
	POST_NOT_EXIST_ERROR,
	LIVE_POST_EDIT_ERROR,
	UNAUTHENTICATED_ERROR,
	UNAUTHORIZED_ERROR,
} from "@/utils/errors";
import { getEditPostByPostId, getPostById } from "@/utils/api utils/posts";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		if (!id) {
			return NextResponse.json(ID_NOT_EXIST_ERROR, { status: 404 });
		}

		const post = await getEditPostByPostId(id);

		if (!post) {
			return NextResponse.json(POST_NOT_EXIST_ERROR, { status: 404 });
		}

		// Authorization: Only the author can see Draft/Not Live posts
		const session = await auth();
		const user = session?.user;

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
