import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/actions/user";
import { getUserKarmaHistory } from "@/utils/karmaUtils";

export async function GET(request: NextRequest) {
	try {
		const currentUser = await getCurrentUser();
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const limit = Number.parseInt(searchParams.get("limit") || "20");
		const offset = Number.parseInt(searchParams.get("offset") || "0");

		const { karmaLogs, total } = await getUserKarmaHistory(
			currentUser.id,
			limit,
			offset,
		);

		return NextResponse.json({
			karmaLogs,
			pagination: {
				limit,
				offset,
				total,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching karma history:", error);
		return NextResponse.json(
			{ error: "Failed to fetch karma history" },
			{ status: 500 },
		);
	}
}
