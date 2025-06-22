"use server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { ERROR, SUCCESS } from "@/utils/contants";
import { validateUser } from "./user";

// FileSystemTree type (imported from playground types)
import type { FileSystemTree } from "@/components/playground/lib/types";
import { TemplateFramework, Prisma } from "@prisma/client";

const ChallengeTemplateSchema = z.object({
	postId: z.string(),
	framework: z.nativeEnum(TemplateFramework),
	questionTemplate: z.any(), // FileSystemTree
	answerTemplate: z.any(), // FileSystemTree
});

export async function createChallengeTemplate(input: {
	postId: string;
	framework: TemplateFramework;
	questionTemplate: FileSystemTree;
	answerTemplate: FileSystemTree;
}) {
	const user = await validateUser();
	if (!user) return { status: ERROR, data: "UNAUTHENTICATED" };

	const validation = ChallengeTemplateSchema.safeParse(input);
	if (!validation.success) return { status: ERROR, data: validation.error };

	try {
		const template = await prisma.challengeTemplate.create({
			data: {
				postId: input.postId,
				framework: input.framework,
				questionTemplate:
					input.questionTemplate as unknown as Prisma.InputJsonValue,
				answerTemplate:
					input.answerTemplate as unknown as Prisma.InputJsonValue,
			},
		});
		return { status: SUCCESS, data: template };
	} catch (e) {
		return { status: ERROR, data: e };
	}
}

export async function updateChallengeTemplate(
	templateId: string,
	input: {
		questionTemplate?: FileSystemTree;
		answerTemplate?: FileSystemTree;
	},
) {
	const user = await validateUser();
	if (!user) return { status: ERROR, data: "UNAUTHENTICATED" };

	const dataToUpdate: Prisma.ChallengeTemplateUpdateInput = {};
	if (input.questionTemplate) {
		dataToUpdate.questionTemplate =
			input.questionTemplate as unknown as Prisma.InputJsonValue;
	}
	if (input.answerTemplate) {
		dataToUpdate.answerTemplate =
			input.answerTemplate as unknown as Prisma.InputJsonValue;
	}

	try {
		const template = await prisma.challengeTemplate.update({
			where: { id: templateId },
			data: dataToUpdate,
		});
		return { status: SUCCESS, data: template };
	} catch (e) {
		return { status: ERROR, data: e };
	}
}

export async function getChallengeTemplates(
	postId: string,
	framework?: TemplateFramework,
) {
	try {
		const where: Prisma.ChallengeTemplateWhereInput = { postId };
		if (framework) where.framework = framework;
		const templates = await prisma.challengeTemplate.findMany({ where });
		return { status: SUCCESS, data: templates };
	} catch (e) {
		return { status: ERROR, data: e };
	}
}

export async function getChallengeTemplate(templateId: string) {
	try {
		const template = await prisma.challengeTemplate.findUnique({
			where: { id: templateId },
		});
		return { status: SUCCESS, data: template };
	} catch (e) {
		return { status: ERROR, data: e };
	}
}

export async function deleteChallengeTemplate(templateId: string) {
	const user = await validateUser();
	if (!user) return { status: ERROR, data: "UNAUTHENTICATED" };
	try {
		await prisma.challengeTemplate.delete({ where: { id: templateId } });
		return { status: SUCCESS };
	} catch (e) {
		return { status: ERROR, data: e };
	}
}
