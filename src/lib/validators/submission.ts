import { z } from "zod";
import { TemplateFramework } from "@prisma/client";
import { INVALID_POST_ID } from "@/utils/contants";
import type { Template } from "@/components/playground/lib/types";

// Challenge submission schema
export const ChallengeSubmissionValidator = z.object({
	postId: z.string().regex(/^[\w-]{21}$/, { message: INVALID_POST_ID }),
	framework: z.nativeEnum(TemplateFramework),
	answerTemplate: z.any(), // Complete Template object (same structure as ChallengeTemplate)
});

export type ChallengeSubmissionType = z.infer<
	typeof ChallengeSubmissionValidator
>;
