import { z } from "zod";
import { PostType, Difficulty, PostCategory, SubCategory } from "@prisma/client";
import {
  INVALID_CATEGORY,
  INVALID_DIFFICULTY,
  INVALID_POST_ID,
  INVALID_POST_TYPE,
  INVALID_SUBCATEGORY,
} from "@/utils/contants";

export const PostDraftValidatorUI = z.object({
  id: z.string().regex(/^[\w-]{21}$/, { message: INVALID_POST_ID }),
  title: z.string().optional(),
  content: z.record(z.any()).optional(),
  type: z.nativeEnum(PostType, { // Use native enum validation
    errorMap: () => ({ message: INVALID_POST_TYPE }),
  }),
  difficulty: z.nativeEnum(Difficulty, { // For other enums too
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
  }),
});

export type PostDraftType = z.infer<typeof PostDraftValidatorUI>;