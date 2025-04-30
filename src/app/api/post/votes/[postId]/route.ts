import { getCurrentUser } from "@/actions/user";
import { fetchVoteCounts } from "@/utils/api utils/vote";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ postId: string }> },
) {
	try {
		const { postId } = await params;
		if (!postId || typeof postId !== "string") {
			return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
		}

		const user = await getCurrentUser();

		const { upVotes, downVotes, userVoteType } = await fetchVoteCounts(
			postId,
			user?.id,
		);

		return NextResponse.json(
			{ upVotes, downVotes, userVoteType },
			{
				status: 200,
				headers: {
					"Cache-Control": "public, max-age=120",
					"Content-Type": "application/json",
				},
			},
		);
	} catch (error) {
		console.error("Error fetching votes:", error);
		return NextResponse.json(
			{ error: "Failed to fetch votes." },
			{ status: 500 },
		);
	}
}
