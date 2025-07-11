import { db } from "@/db";
import { commentMentions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COMMENT_ID_NOT_EXIST_ERROR } from "@/utils/errors";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: commentId } = await params;

		if (!commentId) {
			return NextResponse.json(COMMENT_ID_NOT_EXIST_ERROR, { status: 404 });
		}

		// Fetch all mentions for the given commentId
		const mentions = await db.query.commentMentions.findMany({
			where: eq(commentMentions.commentId, commentId),
			with: {
				user: {
					columns: {
						id: true,
						userName: true,
						email: true,
					},
				},
			},
		});

		// Return mentions or an empty array
		return NextResponse.json(mentions, { status: 200 });
	} catch (error) {
		console.error("Error fetching mentions:", error);
		return NextResponse.json(
			{ error: "Failed to fetch mentions." },
			{ status: 500 },
		);
	}
}
