import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PostStatus, PostApprovalStatus } from "@prisma/client";
import {
	ID_NOT_EXIST_ERROR,
	POST_NOT_EXIST_ERROR,
	POST_NOT_PUBLISHED_ERROR,
} from "@/utils/errors";
import { getPostById } from "@/actions/post";

export async function GET(
	request: NextRequest,
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

		const isPublic =
			post.status === PostStatus.PUBLISHED &&
			post.approvalStatus === PostApprovalStatus.APPROVED;

		if (!isPublic) {
			return NextResponse.json(POST_NOT_PUBLISHED_ERROR, { status: 403 });
		}

		const response = NextResponse.json(post, { status: 200 });
		response.headers.set(
			"Cache-Control",
			"s-maxage=3600, stale-while-revalidate",
		);
		return response;
	} catch (error) {
		console.error("Error fetching post:", error);
		return NextResponse.json(
			{ error: "Failed to fetch post" },
			{ status: 500 },
		);
	}
}
