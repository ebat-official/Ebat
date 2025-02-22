import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PostStatus, PostApprovalStatus } from "@prisma/client";
import {
	ID_NOT_EXIST_ERROR,
	POST_NOT_EXIST_ERROR,
	PUBLISHED_POST_EDIT_ERROR,
	UNAUTHENTICATED_ERROR,
	UNAUTHORIZED_ERROR,
} from "@/utils/errors";

/**
 * Fetches a post by ID with only required fields.
 */
export async function getPostById(postId: string) {
	return prisma.post.findUnique({
		where: { id: postId },
		select: {
			id: true,
			title: true,
			content: true,
			status: true,
			approvalStatus: true,
			authorId: true,
			createdAt: true,
			updatedAt: true,
			difficulty: true,
			companies: true,
			completionDuration: true,
			topics: true,
		},
	});
}

export async function GET(req: Request, context: { params: { id: string } }) {
	try {
		const { id } = await context.params;

		if (!id) {
			return NextResponse.json(ID_NOT_EXIST_ERROR, { status: 404 });
		}

		const post = await getPostById(id);

		if (!post) {
			return NextResponse.json(POST_NOT_EXIST_ERROR, { status: 404 });
		}

		const isPublished = post.status === PostStatus.PUBLISHED;

		// Authorization: Only the author can see Draft/Not Approved posts
		if (isPublished) {
			return NextResponse.json(PUBLISHED_POST_EDIT_ERROR, { status: 403 });
		}
		if (!isPublished) {
			const session = await auth();
			const user = session?.user;

			if (!user) {
				return NextResponse.json(UNAUTHENTICATED_ERROR, { status: 401 });
			}

			const isOwner = post.authorId === user.id;
			if (!isOwner) {
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
