import { Prisma, TemplateFramework } from "@prisma/client";
import type { FileSystemTree } from "@/components/playground/lib/types";

// Helper function to create challenge templates
export const createChallengeTemplatesForPost = async (
	tx: Prisma.TransactionClient,
	postId: string,
	questionTemplate: FileSystemTree,
	answerTemplate: FileSystemTree,
) => {
	const frameworks = Object.values(TemplateFramework);

	for (const framework of frameworks) {
		await tx.challengeTemplate.upsert({
			where: {
				postId_framework: {
					postId,
					framework,
				},
			},
			create: {
				postId,
				framework,
				questionTemplate: questionTemplate as unknown as Prisma.InputJsonValue,
				answerTemplate: answerTemplate as unknown as Prisma.InputJsonValue,
			},
			update: {
				questionTemplate: questionTemplate as unknown as Prisma.InputJsonValue,
				answerTemplate: answerTemplate as unknown as Prisma.InputJsonValue,
			},
		});
	}
};
