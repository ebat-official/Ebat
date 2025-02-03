import { z } from "zod";
import { PostType, Difficulty, PostCategory,  PostStatus,SubCategory } from "@prisma/client"; // Import enums from Prisma

// PostDraftValidator using existing Prisma enums
export const PostDraftValidator = z.object({
  title: z.string().optional(), // Optional title field
  content: z.any().optional(), // Optional content field (JSON)
  authorId: z.string().min(1, { message: "Author ID is required" }), // Required authorId
  comments: z.array(z.object({ id: z.string() })).optional(), // Optional array of comments with id
  votes: z.array(z.object({ id: z.string() })).optional(), // Optional array of votes with id
  type: z.enum(Object.values(PostType), { errorMap: () => ({ message: "Invalid post type" }) }), // Validates against PostType enum
  difficulty: z.enum(Object.values(Difficulty), { errorMap: () => ({ message: "Invalid difficulty" }) }).optional(), // Optional difficulty field
  companies: z.array(z.string()).optional(), // Optional array of companies
  completionDuration: z.number().int().positive().optional(), // Optional duration (in minutes)
  karmaPoints: z.number().int().nonnegative().default(0), // Karma points, must be non-negative (default 0)
  topics: z.array(z.string()).optional(), // Optional array of topics
  category: z.enum(Object.values(PostCategory), { errorMap: () => ({ message: "Invalid category" }) }), // Validates against PostCategory enum
  subCategory: z.enum(Object.values(SubCategory), { errorMap: () => ({ message: "Invalid subCategory" }) }), // Validates against SubCategory enum
  status: z.enum(Object.values(PostStatus), { errorMap: () => ({ message: "Invalid status" }) }).default(PostStatus.DRAFT), // Default status is DRAFT
  viewCount: z.number().int().nonnegative().default(0), // Default view count is 0 (must be non-negative)
  collaborators: z.array(z.object({ id: z.string() })).optional(), // Optional array of collaborators with id
});

export type PostCreationRequest = z.infer<typeof PostDraftValidator>;