"use server";
import { Difficulty, PostStatus, PostType } from '@prisma/client';
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { PostDraftValidator, PostValidator } from "@/lib/validators/post";
import { FailedToEditPostErr, FailedToPublishPostErr, FailedToSaveDraftErr, UserNotAuthenticatedErr, UserNotAuthorizedErr } from "@/utils/errors";
import { z } from "zod";
import { PrismaJson } from '@/utils/types';

// Shared utility functions
const currentUser = async () => {
  const session = await auth();
  return session?.user;
};

const validateUser = async () => {
  const user = await currentUser();
  if (!user) throw UserNotAuthenticatedErr();
  return user;
};

const getPostDetails = async (postId: string) => {
  return await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, status: true }
  });
};

const checkPostOwnership = async (postId: string, userId: string) => {
  const existingPost = await getPostDetails(postId);
  
  if (existingPost && existingPost.authorId !== userId) throw UserNotAuthorizedErr();
};

const checkPostStatus = async (postId: string, allowedStatus: PostStatus[]) => {
  const existingPost = await getPostDetails(postId);
  if (existingPost && !allowedStatus.includes(existingPost.status)) {
    throw FailedToEditPostErr(`Post cannot be modified because it is in ${existingPost.status} status.`);
  }
};

const buildBasePostData = (
  user: { id: string },
  data: z.infer<typeof PostDraftValidator> | z.infer<typeof PostValidator>,
  status: PostStatus
) => ({
  id: data.id,
  authorId: user.id,
  status,
  title: data.title || null,
  content: data.content as PrismaJson,
  type: data.type,
  difficulty: data.difficulty as Difficulty,
  companies: data.companies || [],
  completionDuration: data.completionDuration || null,
  topics: data.topics || [],
  category: data.category,
  subCategory: data.subCategory,
});

// Draft Post Creation
export async function createDraftPost(data: z.infer<typeof PostDraftValidator>) {
  const validation = PostDraftValidator.safeParse(data);
  if (!validation.success) throw validation.error;

  const user = await validateUser();
  if (data.id) {
    await checkPostOwnership(data.id, user.id);
    await checkPostStatus(data.id, ["DRAFT"]); // Only allow updates if the post is in DRAFT status
  }

  const post = await prisma.post.upsert({
    where: { id: data.id || undefined },
    create: buildBasePostData(user, data, "DRAFT"),
    update: buildBasePostData(user, data, "DRAFT"),
  });

  if (!post) throw FailedToSaveDraftErr();
  return post.id;
}

// Published Post Creation
export async function createPost(data: z.infer<typeof PostValidator>) {
  const validation = PostValidator.safeParse(data);
  if (!validation.success) throw validation.error;

  const user = await validateUser();
  if (data.id) {
    await checkPostOwnership(data.id, user.id);
    await checkPostStatus(data.id, ["DRAFT"]); // Only allow publishing if the post is in DRAFT status
  }

  try {
    const post = await prisma.post.upsert({
      where: { id: data.id || undefined },
      create: {
        ...buildBasePostData(user, data, "PUBLISHED"),
        title: data.title, // Required in published post
        companies: data.companies,
        topics: data.topics,
        completionDuration: data.completionDuration,
      },
      update: {
        ...buildBasePostData(user, data, "PUBLISHED"),
        title: data.title,
        companies: data.companies,
        topics: data.topics,
        completionDuration: data.completionDuration,
      },
    });

    return post.id;
  } catch (error) {
    throw FailedToPublishPostErr();
  }
}