import { db } from "@/db";
import { users } from "@/db/schema";
import { USERNAME_NOT_EXIST_ERROR } from "@/utils/errors";
import { asc, ilike } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ userName: string }> },
) {
	try {
		const { userName } = await params;

		if (!userName) {
			return NextResponse.json(USERNAME_NOT_EXIST_ERROR, { status: 400 });
		}

		// Fetch top 5 users whose userName starts with the given input
		const usersList = await db
			.select({
				id: users.id,
				userName: users.userName,
			})
			.from(users)
			.where(ilike(users.userName, `${userName}%`))
			.orderBy(asc(users.userName))
			.limit(5);

		// Return the list of users
		return new NextResponse(JSON.stringify(usersList), {
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
