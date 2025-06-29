"use server";

import { Prisma, ChallengeSubmission } from "@prisma/client";
import prisma from "@/lib/prisma";
import { ChallengeSubmissionValidator } from "@/lib/validators/submission";
import { UNAUTHENTICATED_ERROR, ValidationErr } from "@/utils/errors";
import { z } from "zod";
import { GenerateActionReturnType } from "@/utils/types";
import { validateUser, getCurrentUser } from "./user";
import { ERROR, SUCCESS } from "@/utils/contants";
import {
	FAILED_TO_SUBMIT_CHALLENGE_ERROR,
	FAILED_TO_DELETE_SUBMISSION_ERROR,
	FAILED_TO_FETCH_SUBMISSIONS_ERROR,
	CHALLENGE_NOT_FOUND_ERROR,
	SUBMISSION_NOT_FOUND_ERROR,
	UNAUTHORIZED_ERROR,
} from "@/utils/errors";

// Submit Challenge Solution
export async function submitChallengeSolution(
	data: z.infer<typeof ChallengeSubmissionValidator>,
): Promise<GenerateActionReturnType<string>> {
	const validation = ChallengeSubmissionValidator.safeParse(data);
	if (!validation.success) return { status: ERROR, data: validation.error };

	const user = await validateUser();
	if (!user) return UNAUTHENTICATED_ERROR;

	if (!data.postId) return ValidationErr("Post ID is required");

	try {
		// Create the submission - database will handle foreign key constraints
		const submission = await prisma.challengeSubmission.create({
			data: {
				userId: user.id,
				postId: data.postId,
				framework: data.framework,
				answerTemplate: data.answerTemplate as unknown as Prisma.InputJsonValue,
				runTime: data.runTime,
			},
		});

		return { status: SUCCESS, data: submission.id };
	} catch (error) {
		console.error("Failed to create challenge submission:", error);

		// Handle specific database constraint errors
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2003") {
				return CHALLENGE_NOT_FOUND_ERROR;
			}
		}

		return FAILED_TO_SUBMIT_CHALLENGE_ERROR;
	}
}

// Get user submissions for a specific challenge
export async function getUserSubmissions(
	postId: string,
	userId?: string,
): Promise<GenerateActionReturnType<ChallengeSubmission[]>> {
	try {
		const user = await getCurrentUser();
		const targetUserId = userId || user?.id;

		if (!targetUserId) return UNAUTHENTICATED_ERROR;

		const submissions = await prisma.challengeSubmission.findMany({
			where: {
				postId,
				userId: targetUserId,
			},
			orderBy: {
				submittedAt: "desc",
			},
			include: {
				user: {
					select: {
						id: true,
						userName: true,
						userProfile: {
							select: {
								name: true,
								image: true,
							},
						},
					},
				},
			},
		});

		return { status: SUCCESS, data: submissions };
	} catch (error) {
		console.error("Failed to get user submissions:", error);
		return FAILED_TO_FETCH_SUBMISSIONS_ERROR;
	}
}

// Delete user's submission
export async function deleteSubmission(
	submissionId: string,
): Promise<GenerateActionReturnType<{ message: string }>> {
	try {
		const user = await getCurrentUser();
		if (!user) return UNAUTHENTICATED_ERROR;

		// First check if the submission exists and belongs to the user
		const submission = await prisma.challengeSubmission.findUnique({
			where: { id: submissionId },
			select: { id: true, userId: true },
		});

		if (!submission) {
			return SUBMISSION_NOT_FOUND_ERROR;
		}

		// Only allow users to delete their own submissions
		if (submission.userId !== user.id) {
			return UNAUTHORIZED_ERROR;
		}

		// Delete the submission
		await prisma.challengeSubmission.delete({
			where: { id: submissionId },
		});

		return {
			status: SUCCESS,
			data: { message: "Submission deleted successfully" },
		};
	} catch (error) {
		console.error("Failed to delete submission:", error);
		return FAILED_TO_DELETE_SUBMISSION_ERROR;
	}
}
