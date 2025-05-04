"use server";
import {
	Difficulty,
	Post,
	PostApprovalStatus,
	PostStatus,
	PostType,
} from "@prisma/client";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { PostDraftValidator, PostValidator } from "@/lib/validators/post";
import {
	FailedToEditPostErr,
	LIVE_POST_EDIT_ERROR,
	UNAUTHENTICATED_ERROR,
	UNAUTHORIZED_ERROR,
	ValidationErr,
} from "@/utils/errors";
import { z } from "zod";
import { GenerateActionReturnType, PrismaJson } from "@/utils/types";
import { generateTitleSlug } from "@/utils/generateTileSlug";
import { getCompletionDuration } from "@/utils/getCompletionDuration";
import { getDefaultCoins } from "@/utils/getDefaultCoins";
import { generatePostPath } from "@/utils/generatePostPath";
import { revalidatePath } from "next/cache";
import pako from "pako";
import { validateUser } from "./user";
import { ERROR, SUCCESS } from "@/utils/contants";

// Shared utility functions
const currentUser = async () => {
	const session = await auth();
	return session?.user;
};

const getPostDetails = async (postId: string) => {
	return await prisma.post.findUnique({
		where: { id: postId },
		select: { authorId: true, status: true, approvalStatus: true },
	});
};

const checkPostOwnership = async (postId: string, userId: string) => {
	const existingPost = await getPostDetails(postId);

	if (existingPost && existingPost.authorId !== userId) return false;
	return true;
};

const checkPostLiveStatus = async (postId: string) => {
	const existingPost = await getPostDetails(postId);

	const isLivePost =
		existingPost?.approvalStatus === PostApprovalStatus.APPROVED;
	return { existingPost, isLivePost };
};

const revalidatePostPath = (post: Post) => {
	const path = generatePostPath({
		category: post.category,
		subCategory: post.subCategory,
		slug: post.slug || "",
		id: post.id,
		postType: post.type,
	});
	revalidatePath(path);
};

const buildBasePostData = (
	user: { id: string },
	data: z.infer<typeof PostDraftValidator> | z.infer<typeof PostValidator>,
	status: PostStatus,
) => ({
	id: data.id,
	authorId: user.id,
	status,
	title: data.title || null,
	content: pako.deflate(JSON.stringify(data.content)),
	type: data.type,
	difficulty: data.difficulty as Difficulty,
	companies: data.companies || [],
	completionDuration: data.completionDuration || null,
	topics: data.topics || [],
	category: data.category,
	subCategory: data.subCategory,
});

// Draft Post Creation

export async function createDraftPost(
	data: z.infer<typeof PostDraftValidator>,
): Promise<GenerateActionReturnType<string>> {
	const validation = PostDraftValidator.safeParse(data);
	if (!validation.success) return { status: ERROR, data: validation.error };

	const user = await validateUser();

	if (!user) return UNAUTHENTICATED_ERROR;
	if (!data.id) return ValidationErr("Post ID is required");
	const isOwner = await checkPostOwnership(data.id, user.id);
	if (!isOwner) return UNAUTHORIZED_ERROR;

	const postData = {
		...buildBasePostData(user, data, "DRAFT"),
		approvalStatus: PostApprovalStatus.PENDING,
		approvalLogs: [],
	};

	const post = await prisma.post.upsert({
		where: { id: data.id || undefined },
		create: postData,
		update: postData,
	});
	return { status: SUCCESS, data: post.id };
}

type CreatePostReturnType = { id: string; slug: string | null };
// Published Post Creation
export async function createPost(
	data: z.infer<typeof PostValidator>,
): Promise<GenerateActionReturnType<CreatePostReturnType>> {
	const validation = PostValidator.safeParse(data);
	if (!validation.success) return { status: ERROR, data: validation.error };

	const user = await validateUser();

	if (!user) return UNAUTHENTICATED_ERROR;
	if (!data.id) return ValidationErr("Post ID is required");
	//return true if post not exists or owner is current user
	const isOwner = await checkPostOwnership(data.id, user.id);
	if (!isOwner) {
		if (!(data.type === PostType.BLOGS)) return UNAUTHENTICATED_ERROR;
		createPostEdit(data);
	}
	const { isLivePost } = await checkPostLiveStatus(data.id); // Only allow updates if the post is not in LIVE status
	if (isLivePost) {
		return LIVE_POST_EDIT_ERROR;
	}

	const postData = {
		...buildBasePostData(user, data, "PUBLISHED"),
		title: data.title,
		completionDuration: getCompletionDuration(data),
		coins: getDefaultCoins(data),
		approvalStatus:
			data.type === PostType.BLOGS
				? PostApprovalStatus.APPROVED
				: PostApprovalStatus.PENDING,
		approvalLogs: [],
		slug: generateTitleSlug(data.title),
	};

	const post = await prisma.post.upsert({
		where: { id: data.id || undefined },
		create: postData,
		update: postData,
	});

	// Trigger revalidation for the post's path
	revalidatePostPath(post);
	return { status: SUCCESS, data: { id: post.id, slug: post.slug } };
}

export async function createPostEdit(
	data: z.infer<typeof PostValidator>,
): Promise<GenerateActionReturnType<CreatePostReturnType>> {
	// Validate the input data

	const validation = PostValidator.safeParse(data);
	if (!validation.success) return { status: ERROR, data: validation.error };

	const { isLivePost, existingPost } = await checkPostLiveStatus(data.id);
	// Only allow updates if the post is not in LIVE status
	if (!existingPost) {
		return FailedToEditPostErr("The post does not exist.");
	}

	if (!isLivePost) {
		return FailedToEditPostErr("Only live posts can be edited.");
	}

	const user = await validateUser();
	if (!user) return UNAUTHENTICATED_ERROR;

	// Build the post edit data
	const postEditData = {
		postId: data.id,
		authorId: user.id,
		title: data.title,
		content: data.content,
		type: data.type,
		difficulty: data.difficulty,
		companies: data.companies || [],
		completionDuration: data.completionDuration || null,
		topics: data.topics || [],
		approvalLogs: [],
	};

	const postEdit = await prisma.postEdit.upsert({
		where: {
			postId_authorId: {
				postId: data.id,
				authorId: user.id,
			},
		},
		create: postEditData as PrismaJson,
		update: postEditData as PrismaJson,
	});

	return { status: SUCCESS, data: { id: postEdit.postId, slug: "" } };
}
