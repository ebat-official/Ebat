import { z } from "zod";
import { PostType, Difficulty, PostCategory, SubCategory } from "@prisma/client";
import {
  ANSWER_REQUIRED,
  INVALID_CATEGORY,
  INVALID_DIFFICULTY,
  INVALID_POST_ID,
  INVALID_POST_TYPE,
  INVALID_SUBCATEGORY,
  POST_REQUIRED,
  TITLE_MIN_LENGTH,
} from "@/utils/contants";
import { OutputData } from "@editorjs/editorjs";
import { EditorContent } from "@/utils/types";

export const PostDraftValidator = z.object({
  id: z.string().regex(/^[\w-]{21}$/, { message: INVALID_POST_ID }),
  title: z.string().optional(),
  content: z.record(z.any()).optional(),
  type: z.nativeEnum(PostType, { 
    errorMap: () => ({ message: INVALID_POST_TYPE }),
  }),
  difficulty: z.nativeEnum(Difficulty, { 
    errorMap: () => ({ message: INVALID_DIFFICULTY }),
  }).nullable().optional(),
  companies: z.array(z.string()).optional(),
  completionDuration: z.number().int().positive().optional(),
  topics: z.array(z.string()).optional(),
  category: z.nativeEnum(PostCategory, {
    errorMap: () => ({ message: INVALID_CATEGORY }),
  }),
  subCategory: z.nativeEnum(SubCategory, {
    errorMap: () => ({ message: INVALID_SUBCATEGORY }),
  }).optional(),
}).superRefine((data, ctx) => {
  if ((data.type !== PostType.BLOGS && data.type !== PostType.SYSTEM_DESIGN) && !data.subCategory) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: INVALID_SUBCATEGORY,
      path: ["subCategory"],
    });
  }
});




// Define content interface




// Base schema with common fields
const BasePostValidator = z.object({
  id: z.string().regex(/^[\w-]{21}$/, {
    message: INVALID_POST_ID,
  }),
  title: z.string().min(3, TITLE_MIN_LENGTH),
  type: z.nativeEnum(PostType, {
    errorMap: () => ({ message: INVALID_POST_TYPE }),
  }),
  difficulty: z.nativeEnum(Difficulty, {
    errorMap: () => ({ message: INVALID_DIFFICULTY }),
  }),
  companies: z.array(z.string()).optional(),
  completionDuration: z.number().int().positive().optional(),
  topics: z.array(z.string()).optional(),
  category: z.nativeEnum(PostCategory, {
    errorMap: () => ({ message: INVALID_CATEGORY }),
  }),
  subCategory: z.nativeEnum(SubCategory, {
    errorMap: () => ({ message: INVALID_SUBCATEGORY }),
  }).optional(),
  content: z.object({
    post: z.custom<EditorContent>().optional(),
    answer: z.custom<EditorContent>().optional(),
  }),
}).superRefine((data, ctx) => {
  if (!(data.type === PostType.BLOGS || data.type === PostType.SYSTEM_DESIGN)) {
    if (!data.subCategory) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: INVALID_SUBCATEGORY,
        path: ["subCategory"],
      });
    }
  }
});


// Create the main validator with conditional content rules
export const PostValidator = BasePostValidator.superRefine((data, ctx) => {
  const { type, content } = data;

  if (type === PostType.QUESTION) {
    if (!content.answer?.blocks || content.answer.blocks.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: ANSWER_REQUIRED,
        path: ["content", "answer"],
      });
    }
  } else {
    if (!content.post?.blocks || content.post.blocks.length === 0) {
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