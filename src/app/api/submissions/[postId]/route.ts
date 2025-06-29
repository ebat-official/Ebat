import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/actions/user";
import { UNAUTHENTICATED_ERROR } from "@/utils/errors";
import { FAILED_TO_FETCH_SUBMISSIONS } from "@/utils/contants";

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
		const submissions = await prisma.challengeSubmission.findMany({
			where: {
				postId,
				userId: user.id, // Only fetch current user's submissions
			},
			orderBy: {
				submittedAt: "desc",
			},
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
