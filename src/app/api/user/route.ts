import { getCurrentUser } from "@/actions/user";
import { NextResponse } from "next/server";
import { checkRateLimit, ApiActions, RateLimitCategory } from "@/lib/rateLimit";

export async function GET() {
	// Rate limiting
	const rateLimitCheck = await checkRateLimit(
		RateLimitCategory.API,
		ApiActions.USER,
	);
	if (!rateLimitCheck.success) {
		return NextResponse.json({ error: rateLimitCheck.error }, { status: 429 });
	}

	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
		}
		return NextResponse.json(user);
	} catch (error) {
		console.error("Error fetching user profile:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user profile" },
			{ status: 500 },
		);
	}
}
