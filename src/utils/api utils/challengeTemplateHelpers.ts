import { TemplateFramework, TemplateFrameworkType } from "@/db/schema/enums";
import { challengeTemplates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { FileSystemTree } from "@/components/playground/lib/types";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type * as schema from "@/db/schema";

// Helper function to create challenge templates
export const createChallengeTemplatesForPost = async (
	tx: PgTransaction<
		NodePgQueryResultHKT,
		typeof schema,
		ExtractTablesWithRelations<typeof schema>
	>,
	postId: string,
	questionTemplate: FileSystemTree,
	answerTemplate: FileSystemTree,
) => {
	const frameworks = Object.values(TemplateFramework);

	for (const framework of frameworks) {
		// Check if template exists
		const existing = await tx
			.select()
			.from(challengeTemplates)
			.where(
				and(
					eq(challengeTemplates.postId, postId),
					eq(challengeTemplates.framework, framework as TemplateFrameworkType),
				),
			)
			.limit(1);

		if (existing.length > 0) {
			// Update existing template
			await tx
				.update(challengeTemplates)
				.set({
					questionTemplate: JSON.stringify(questionTemplate),
					answerTemplate: JSON.stringify(answerTemplate),
				})
				.where(
					and(
						eq(challengeTemplates.postId, postId),
						eq(
							challengeTemplates.framework,
							framework as TemplateFrameworkType,
						),
					),
				);
		} else {
			// Create new template
			await tx.insert(challengeTemplates).values({
				postId,
				framework: framework as TemplateFrameworkType,
				questionTemplate: JSON.stringify(questionTemplate),
				answerTemplate: JSON.stringify(answerTemplate),
			});
		}
	}
};
