import { isLexicalEditorEmpty } from "@/components/shared/Lexical Editor/utils/isLexicalEditorEmpty";
import {
	Difficulty,
	PostCategory,
	PostType,
	SubCategory,
	TemplateFramework,
} from "@/db/schema/enums";
import {
	ANSWER_REQUIRED,
	INVALID_CATEGORY,
	INVALID_DIFFICULTY,
	INVALID_POST_ID,
	INVALID_POST_TYPE,
	INVALID_SUBCATEGORY,
	POST_REQUIRED,
	TITLE_MIN_LENGTH,
	TOPICS_REQUIRED,
} from "@/utils/constants";
import { EditorContent } from "@/utils/types";
import { z } from "zod";

// FileSystemTree schema based on WebContainer API structure
const FileNodeSchema = z.object({
	file: z.object({
		contents: z.union([z.string(), z.instanceof(Uint8Array)]),
	}),
});

const SymlinkNodeSchema = z.object({
	file: z.object({
		symlink: z.string(),
	}),
});

const DirectoryNodeSchema: z.ZodType<{
	directory: Record<string, z.infer<typeof FileSystemNodeSchema>>;
}> = z.lazy(() =>
	z.object({
		directory: z.record(z.string(), FileSystemNodeSchema),
	}),
);

const FileSystemNodeSchema = z.union([
	FileNodeSchema,
	SymlinkNodeSchema,
	DirectoryNodeSchema,
]);

const FileSystemTreeSchema = z.record(z.string(), FileSystemNodeSchema);

// Challenge template schema
const ChallengeTemplateSchema = z.object({
	framework: z.nativeEnum(TemplateFramework),
	questionTemplate: FileSystemTreeSchema,
	answerTemplate: FileSystemTreeSchema,
});

export const PostDraftValidator = z.object({
	id: z.string().regex(/^[\w-]{21}$/, { message: INVALID_POST_ID }),
	title: z.string().optional(),
	content: z.record(z.any()).optional(),
	type: z.nativeEnum(PostType, {
		errorMap: () => ({ message: INVALID_POST_TYPE }),
	}),
	difficulty: z
		.nativeEnum(Difficulty, {
			errorMap: () => ({ message: INVALID_DIFFICULTY }),
		})
		.nullable()
		.optional(),
	companies: z.array(z.string()).optional(),
	completionDuration: z.number().int().positive().optional(),
	topics: z.array(z.string()).optional(),
	thumbnail: z.string().url().optional().nullable(),
	category: z.nativeEnum(PostCategory, {
		errorMap: () => ({ message: INVALID_CATEGORY }),
	}),
	subCategory: z.nativeEnum(SubCategory, {
		errorMap: () => ({ message: INVALID_SUBCATEGORY }),
	}),
	// Challenge templates are optional for drafts
	challengeTemplates: z.array(ChallengeTemplateSchema).optional(),
});

// Define content interface

// Base schema with common fields
const BasePostValidator = z
	.object({
		id: z.string().regex(/^[\w-]{21}$/, {
			message: INVALID_POST_ID,
		}),
		title: z.string().min(3, TITLE_MIN_LENGTH),
		type: z.nativeEnum(PostType, {
			errorMap: () => ({ message: INVALID_POST_TYPE }),
		}),
		difficulty: z
			.nativeEnum(Difficulty, {
				errorMap: () => ({ message: INVALID_DIFFICULTY }),
			})
			.optional(), // Initially optional, will enforce validation conditionally
		companies: z.array(z.string()).optional(),
		completionDuration: z.number().int().positive().optional(),
		topics: z.array(z.string()).min(1, TOPICS_REQUIRED),
		category: z.nativeEnum(PostCategory, {
			errorMap: () => ({ message: INVALID_CATEGORY }),
		}),
		subCategory: z.nativeEnum(SubCategory, {
			errorMap: () => ({ message: INVALID_SUBCATEGORY }),
		}),
		content: z.object({
			post: z.custom<EditorContent>().optional(),
			answer: z.custom<EditorContent>().optional(),
		}),
		thumbnail: z.string().url().optional().nullable(),
		// Challenge templates are optional in base validator, will be validated conditionally
		challengeTemplates: z.array(ChallengeTemplateSchema).optional(),
	})
	.superRefine((data, ctx) => {
		// Ensure difficulty is required unless it's a BLOGS type
		if (data.type !== PostType.BLOGS && !data.difficulty) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: INVALID_DIFFICULTY,
				path: ["difficulty"],
			});
		}

		// Ensure challenge templates are provided for CHALLENGE type
		if (data.type === PostType.CHALLENGE) {
			if (!data.challengeTemplates || data.challengeTemplates.length === 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Question and Solution templates are required",
					path: ["challengeTemplates"],
				});
			} else {
				// Validate each template has all required fields
				data.challengeTemplates.forEach((template, index) => {
					if (!template.framework) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: "Framework is missing in challenge template",
							path: ["challengeTemplates", index, "framework"],
						});
					}
					if (!template.questionTemplate) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: `Question boilerplate is required for ${template.framework || "challenge"} template`,
							path: ["challengeTemplates", index, "questionTemplate"],
						});
					}
					if (!template.answerTemplate) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: `Code Solution is required for ${template.framework || "challenge"} template`,
							path: ["challengeTemplates", index, "answerTemplate"],
						});
					}
				});
			}
		}

		// Ensure thumbnail is required for BLOGS and SYSTEMDESIGN
		if (
			(data.type === PostType.BLOGS || data.type === PostType.SYSTEMDESIGN) &&
			!data.thumbnail
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Thumbnail is required for post",
				path: ["thumbnail"],
			});
		}
	});

// Create the main validator with conditional content rules
export const PostValidator = BasePostValidator.superRefine((data, ctx) => {
	const { type, content } = data;

	if (type === PostType.QUESTION) {
		// @ts-ignore
		if (
			!content.answer?.blocks ||
			isLexicalEditorEmpty(content.answer.blocks)
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: ANSWER_REQUIRED,
				path: ["content", "answer"],
			});
		}
	} else {
		if (!content.post?.blocks || isLexicalEditorEmpty(content.post.blocks)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: POST_REQUIRED,
				path: ["content", "post"],
			});
		}
	}
});

export type ValidatedPostType = z.infer<typeof PostValidator>;

export type PostDraftType = z.infer<typeof PostDraftValidator>;

// Export the FileSystemTree schema for reuse
export { FileSystemTreeSchema };
