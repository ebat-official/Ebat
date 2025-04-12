import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
	const { path } = await req.json();

	if (!path) {
		return NextResponse.json({ message: "Path is required" }, { status: 400 });
	}

	try {
		// Trigger revalidation for the specified path
		revalidatePath(path);
		return NextResponse.json({ revalidated: true });
	} catch (err) {
		console.error("Error revalidating:", err);
		return NextResponse.json(
			{ message: "Error revalidating" },
			{ status: 500 },
		);
	}
}
