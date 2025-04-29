import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: { postId: string } },
) {
	try {
		const { postId } = params;
		if (!postId || typeof postId !== "string") {
			return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
		}
		const votes = await prisma.vote.groupBy({
			by: ["type"],
			where: {
				postId,
			},
			_count: {
				type: true,
			},
		});

		const upVotes = votes.find((vote) => vote.type === "UP")?._count.type || 0;
		const downVotes =
			votes.find((vote) => vote.type === "DOWN")?._count.type || 0;

		return NextResponse.json(
			{ upVotes, downVotes },
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
