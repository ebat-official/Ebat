import { getCurrentUser } from "@/actions/user";
import { db } from "@/db";
import { challengeSubmissions } from "@/db/schema";
import { FAILED_TO_FETCH_SUBMISSIONS } from "@/utils/contants";
import { UNAUTHENTICATED_ERROR } from "@/utils/errors";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ postId: string }> },
) {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json(UNAUTHENTICATED_ERROR, { status: 401 });
		}

		const { postId } = await params;

		// Get only current user's submissions for this challenge
		const submissions = await db.query.challengeSubmissions.findMany({
			where: and(
				eq(challengeSubmissions.postId, postId),
				eq(challengeSubmissions.userId, user.id),
			),
			orderBy: [desc(challengeSubmissions.submittedAt)],
		});

		return NextResponse.json(submissions);
	} catch (error) {
		console.error(FAILED_TO_FETCH_SUBMISSIONS, error);
		return NextResponse.json(
			{ error: FAILED_TO_FETCH_SUBMISSIONS },
			{ status: 500 },
		);
	}
}
