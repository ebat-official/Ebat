import { NextRequest, NextResponse } from "next/server";
import {
	validateVerificationToken,
	deleteVerificationToken,
} from "@/actions/auth";
import { setEmailVerifiedUsingToken } from "@/actions/user";
import { ERROR, SUCCESS } from "@/utils/contants";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const token = searchParams.get("token");

	if (!token) {
		return NextResponse.redirect(
			new URL(
				`/verify?error=${encodeURIComponent("Token not found")}`,
				request.url,
			),
		);
	}

	// Validate the token
	const validationResult = await validateVerificationToken(token);

	if (validationResult.status === ERROR) {
		const errorMessage =
			typeof validationResult.data === "string"
				? validationResult.data
				: (validationResult.data as { message: string })?.message ||
					"Validation failed";
		return NextResponse.redirect(
			new URL(`/verify?error=${encodeURIComponent(errorMessage)}`, request.url),
		);
	}

	// Verify the email
	const verificationResult = await setEmailVerifiedUsingToken(token);

	if (!verificationResult) {
		return NextResponse.redirect(
			new URL(
				`/verify?error=${encodeURIComponent("Failed to verify email")}`,
				request.url,
			),
		);
	}

	// Delete the verification token
	if (
		typeof validationResult.data === "object" &&
		"email" in validationResult.data
	) {
		await deleteVerificationToken(validationResult.data.email as string);
	}

	// Redirect to the verification page with success
	return NextResponse.redirect(new URL(`/verify?token=${token}`, request.url));
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { token } = body;

		if (!token) {
			return NextResponse.json({ error: "Token not found" }, { status: 400 });
		}

		// Validate the token
		const validationResult = await validateVerificationToken(token);

		if (validationResult.status === ERROR) {
			return NextResponse.json(
				{
					error: validationResult.data,
				},
				{ status: 400 },
			);
		}

		// Verify the email
		const verificationResult = await setEmailVerifiedUsingToken(token);

		if (!verificationResult) {
			return NextResponse.json(
				{
					error: "Failed to verify email",
				},
				{ status: 500 },
			);
		}

		// Delete the verification token
		if (
			typeof validationResult.data === "object" &&
			"email" in validationResult.data
		) {
			await deleteVerificationToken(validationResult.data.email as string);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}
}
