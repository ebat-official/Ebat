"use server";
import {
	Difficulty,
	PostApprovalStatus,
	PostStatus,
	PostType,
} from "@prisma/client";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { PostDraftValidator, PostValidator } from "@/lib/validators/post";
import {
	FailedToEditPostErr,
	FailedToPublishPostErr,
	FailedToSaveDraftErr,
	LIVE_POST_EDIT_ERROR,
	UserNotAuthenticatedErr,
	UserNotAuthorizedErr,
} from "@/utils/errors";
import { z } from "zod";
import { PrismaJson } from "@/utils/types";

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
		select: { authorId: true, status: true, approvalStatus: true },
	});
};

const checkPostOwnership = async (postId: string, userId: string) => {
	const existingPost = await getPostDetails(postId);

	if (existingPost && existingPost.authorId !== userId)
		throw UserNotAuthorizedErr();
};

const checkPostStatus = async (postId: string, allowedStatus: PostStatus[]) => {
	const existingPost = await getPostDetails(postId);
	if (existingPost && !allowedStatus.includes(existingPost.status)) {
		throw FailedToEditPostErr(
			`Post cannot be modified because it is in ${existingPost.status} status.`,
		);
	}
};

const checkPostLiveStatus = async (postId: string) => {
	const existingPost = await getPostDetails(postId);

	const isLivePost =
		existingPost?.approvalStatus === PostApprovalStatus.APPROVED;
	if (existingPost && isLivePost) {
		throw LIVE_POST_EDIT_ERROR;
	}
};

const getCompletionDuration = (data: z.infer<typeof PostValidator>) => {
	if (data.completionDuration) {
		return data.completionDuration;
	}

	switch (data.type) {
		case PostType.QUESTION:
			switch (data.difficulty) {
				case Difficulty.EASY:
					return 1;
				case Difficulty.MEDIUM:
					return 3;
				case Difficulty.HARD:
					return 5;
				default:
					return null;
			}
		case PostType.ARTICLE:
			switch (data.difficulty) {
				case Difficulty.EASY:
					return 10;
				case Difficulty.MEDIUM:
					return 20;
				case Difficulty.HARD:
					return 45;
				default:
					return null;
			}
		default:
			return null;
	}
};

const getCoins = (data: z.infer<typeof PostValidator>) => {
	switch (data.type) {
		case PostType.QUESTION:
			switch (data.difficulty) {
				case Difficulty.EASY:
					return 1;
				case Difficulty.MEDIUM:
					return 3;
				case Difficulty.HARD:
					return 5;
				default:
					return 0;
			}
		case PostType.ARTICLE:
			switch (data.difficulty) {
				case Difficulty.EASY:
					return 5;
				case Difficulty.MEDIUM:
					return 10;
				case Difficulty.HARD:
					return 20;
				default:
					return 0;
			}
		default:
			return 0;
	}
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
export async function createDraftPost(
	data: z.infer<typeof PostDraftValidator>,
) {
	const validation = PostDraftValidator.safeParse(data);
	if (!validation.success) throw validation.error;

	const user = await validateUser();
	if (data.id) {
		await checkPostOwnership(data.id, user.id);
	}

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
		await checkPostLiveStatus(data.id); // Only allow updates if the post is not in LIVE status
	}

	const postData = {
		...buildBasePostData(user, data, "PUBLISHED"),
		title: data.title, // Required in published post
		completionDuration: getCompletionDuration(data),
		coins: getCoins(data),
		approvalStatus: PostApprovalStatus.PENDING,
		approvalLogs: [],
	};

	try {
		const post = await prisma.post.upsert({
			where: { id: data.id || undefined },
			create: postData,
			update: postData,
		});

		return post.id;
	} catch (error) {
		throw FailedToPublishPostErr();
	}
}
