import { z } from "zod";
import { TemplateFramework, SubmissionStatus } from "@/db/schema/enums";
import { INVALID_POST_ID } from "@/utils/contants";
import type { Template } from "@/components/playground/lib/types";

// Challenge submission schema
export const ChallengeSubmissionValidator = z.object({
	postId: z.string().regex(/^[\w-]{21}$/, { message: INVALID_POST_ID }),
	framework: z.nativeEnum(TemplateFramework),
	answerTemplate: z.record(z.any()), // Allow any object to match Template type
	runTime: z.number().int().min(0).default(0), // Runtime in milliseconds
	status: z.nativeEnum(SubmissionStatus).default(SubmissionStatus.REJECTED), // Status of the submission
});

export type ChallengeSubmissionType = z.infer<
	typeof ChallengeSubmissionValidator
>;
