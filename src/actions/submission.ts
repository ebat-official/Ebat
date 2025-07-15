"use server";

import { db } from "@/db";
import { challengeSubmissions } from "@/db/schema";
import {
	SubmissionStatus,
	TemplateFramework,
	UserRole,
} from "@/db/schema/enums";
import { ChallengeSubmission } from "@/db/schema/zod-schemas";
import { ChallengeSubmissionValidator } from "@/lib/validators/submission";
import { ERROR, POST_ID_REQUIRED, SUCCESS } from "@/utils/contants";
import { UNAUTHENTICATED_ERROR, ValidationErr } from "@/utils/errors";
import {
	CHALLENGE_NOT_FOUND_ERROR,
	FAILED_TO_DELETE_SUBMISSION_ERROR,
	FAILED_TO_FETCH_SUBMISSIONS_ERROR,
	FAILED_TO_SUBMIT_CHALLENGE_ERROR,
	SUBMISSION_NOT_FOUND_ERROR,
	UNAUTHORIZED_ERROR,
} from "@/utils/errors";
import { GenerateActionReturnType } from "@/utils/types";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUser, validateUser } from "./user";

// Submit Challenge Solution
export async function submitChallengeSolution(
	data: z.infer<typeof ChallengeSubmissionValidator>,
): Promise<GenerateActionReturnType<string>> {
	const validation = ChallengeSubmissionValidator.safeParse(data);
	if (!validation.success) return { status: ERROR, data: validation.error };

	const user = await validateUser();
	if (!user) return UNAUTHENTICATED_ERROR;

	const validatedData = validation.data;
	if (!validatedData.postId) return ValidationErr(POST_ID_REQUIRED);

	try {
		// Create the submission - database will handle foreign key constraints
		const submission = await db
			.insert(challengeSubmissions)
			.values({
				userId: user.id,
				postId: validatedData.postId,
				framework: validatedData.framework as TemplateFramework,
				answerTemplate: validatedData.answerTemplate,
				runTime: validatedData.runTime,
				status: validatedData.status as SubmissionStatus,
			})
			.returning();

		return { status: SUCCESS, data: submission[0].id };
	} catch (error) {
		console.error("Failed to create challenge submission:", error);
		return FAILED_TO_SUBMIT_CHALLENGE_ERROR;
	}
}

// Delete Challenge Submission
export async function deleteChallengeSubmission(
	submissionId: string,
): Promise<GenerateActionReturnType<string>> {
	if (!submissionId) return ValidationErr("Submission ID is required");

	const user = await validateUser();
	if (!user) return UNAUTHENTICATED_ERROR;

	try {
		// Check if submission exists and belongs to user
		const submission = await db.query.challengeSubmissions.findFirst({
			where: eq(challengeSubmissions.id, submissionId),
			columns: { userId: true },
		});

		if (!submission) return SUBMISSION_NOT_FOUND_ERROR;
		if (submission.userId !== user.id) return UNAUTHORIZED_ERROR;

		// Delete the submission
		await db
			.delete(challengeSubmissions)
			.where(eq(challengeSubmissions.id, submissionId));

		return { status: SUCCESS, data: "Submission deleted successfully" };
	} catch (error) {
		console.error("Failed to delete challenge submission:", error);
		return FAILED_TO_DELETE_SUBMISSION_ERROR;
	}
}

// Get User Submissions for a Post
export async function getUserSubmissions(
	postId: string,
): Promise<GenerateActionReturnType<ChallengeSubmission[]>> {
	if (!postId) return ValidationErr(POST_ID_REQUIRED);

	const user = await validateUser();
	if (!user) return UNAUTHENTICATED_ERROR;

	try {
		const submissions = await db.query.challengeSubmissions.findMany({
			where: and(
				eq(challengeSubmissions.postId, postId),
				eq(challengeSubmissions.userId, user.id),
			),
			orderBy: (challengeSubmissions, { desc }) => [
				desc(challengeSubmissions.submittedAt),
			],
		});

		return { status: SUCCESS, data: submissions };
	} catch (error) {
		console.error("Failed to fetch user submissions:", error);
		return FAILED_TO_FETCH_SUBMISSIONS_ERROR;
	}
}

// Get All Submissions for a Post (Admin/Author only)
export async function getPostSubmissions(
	postId: string,
): Promise<GenerateActionReturnType<ChallengeSubmission[]>> {
	if (!postId) return ValidationErr(POST_ID_REQUIRED);

	const user = await validateUser();
	if (!user) return UNAUTHENTICATED_ERROR;

	try {
		const submissions = await db.query.challengeSubmissions.findMany({
			where: eq(challengeSubmissions.postId, postId),
			orderBy: (challengeSubmissions, { desc }) => [
				desc(challengeSubmissions.submittedAt),
			],
			with: {
				user: {
					columns: {
						id: true,
						userName: true,
						name: true,
						image: true,
					},
				},
			},
		});

		return { status: SUCCESS, data: submissions };
	} catch (error) {
		console.error("Failed to fetch post submissions:", error);
		return FAILED_TO_FETCH_SUBMISSIONS_ERROR;
	}
}

// Get Submission by ID
export async function getSubmissionById(
	submissionId: string,
): Promise<GenerateActionReturnType<ChallengeSubmission>> {
	if (!submissionId) return ValidationErr("Submission ID is required");

	const user = await validateUser();
	if (!user) return UNAUTHENTICATED_ERROR;

	try {
		const submission = await db.query.challengeSubmissions.findFirst({
			where: eq(challengeSubmissions.id, submissionId),
		});

		if (!submission) return SUBMISSION_NOT_FOUND_ERROR;

		// Check if user owns the submission or is admin
		if (submission.userId !== user.id && user.role !== UserRole.ADMIN) {
			return UNAUTHORIZED_ERROR;
		}

		return { status: SUCCESS, data: submission };
	} catch (error) {
		console.error("Failed to fetch submission:", error);
		return FAILED_TO_FETCH_SUBMISSIONS_ERROR;
	}
}

// Alias for backward compatibility
export const deleteSubmission = deleteChallengeSubmission;
