import prisma from "@/lib/prisma";
import { USERNAME_NOT_EXIST_ERROR } from "@/utils/errors";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: { userName: string } },
) {
	try {
		const { userName } = params;

		if (!userName) {
			return NextResponse.json(USERNAME_NOT_EXIST_ERROR, { status: 400 });
		}

		// Fetch top 5 users whose userName starts with the given input
		const users = await prisma.user.findMany({
			where: {
				userName: {
					startsWith: userName, // Match userName starting with the input
					mode: "insensitive", // Case-insensitive search
				},
			},
			select: {
				id: true,
				userName: true,
			},
			orderBy: {
				userName: "asc",
			},
			take: 5, // Limit the results to the top 5 matches
		});

		// Return the list of users
		return new NextResponse(JSON.stringify(users), {
			status: 200,
			headers: {
				"Cache-Control": "public, max-age=120", // cache for 120 seconds
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json(
			{ error: "Failed to fetch users." },
			{ status: 500 },
		);
	}
}
