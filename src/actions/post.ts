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
	FailedToPublishPostErr,
	FailedToSaveDraftErr,
	LIVE_POST_EDIT_ERROR,
	UserNotAuthenticatedErr,
	UserNotAuthorizedErr,
	ValidationErr,
} from "@/utils/errors";
import { z } from "zod";
import { PrismaJson } from "@/utils/types";
import { generateTitleSlug } from "@/utils/generateTileSlug";
import { getCompletionDuration } from "@/utils/getCompletionDuration";
import { getDefaultCoins } from "@/utils/getDefaultCoins";
import { generatePostPath } from "@/utils/generatePostPath";
import { revalidatePath } from "next/cache";
import pako from "pako";

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

	if (existingPost && existingPost.authorId !== userId) return false;
	return true;
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
) {
	const validation = PostDraftValidator.safeParse(data);
	if (!validation.success) throw validation.error;

	const user = await validateUser();
	if (!data.id) throw ValidationErr("Post ID is required");
	const isOwner = await checkPostOwnership(data.id, user.id);
	if (!isOwner) throw UserNotAuthorizedErr();

	const postData = {
		...buildBasePostData(user, data, "DRAFT"),
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
		throw FailedToSaveDraftErr();
	}
}

// Published Post Creation
export async function createPost(data: z.infer<typeof PostValidator>) {
	const validation = PostValidator.safeParse(data);
	if (!validation.success) throw validation.error;

	const user = await validateUser();
	if (!data.id) throw ValidationErr("Post ID is required");
	//return true if post not exists or owner is current user
	const isOwner = await checkPostOwnership(data.id, user.id);
	if (!isOwner) {
		if (!(data.type === PostType.BLOGS)) throw UserNotAuthorizedErr();
		createPostEdit(data);
	}
	const { isLivePost } = await checkPostLiveStatus(data.id); // Only allow updates if the post is not in LIVE status
	if (isLivePost) {
		throw LIVE_POST_EDIT_ERROR;
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

	try {
		const post = await prisma.post.upsert({
			where: { id: data.id || undefined },
			create: postData,
			update: postData,
		});

		// Trigger revalidation for the post's path
		revalidatePostPath(post);
		return { id: post.id, slug: post.slug };
	} catch (error) {
		throw FailedToPublishPostErr();
	}
}

export async function getPostById(postId: string) {
	const post = await prisma.post.findUnique({
		where: { id: postId },
	});

	if (post?.content) {
		post.content = JSON.parse(pako.inflate(post.content, { to: "string" }));
	}
	console.log(post?.content, "mola");
	return post;
}

export async function createPostEdit(
	data: z.infer<typeof PostValidator>,
): Promise<{ id: string; slug: string | null }> {
	// Validate the input data

	const validation = PostValidator.safeParse(data);
	if (!validation.success) throw validation.error;

	const { isLivePost, existingPost } = await checkPostLiveStatus(data.id);
	// Only allow updates if the post is not in LIVE status
	if (!existingPost) {
		throw FailedToEditPostErr("The post does not exist.");
	}

	if (!isLivePost) {
		throw FailedToEditPostErr("Only live posts can be edited.");
	}

	const user = await validateUser();

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

	try {
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

		return { id: postEdit.postId, slug: "" };
	} catch (error) {
		throw FailedToEditPostErr("Failed to create the post edit.");
	}
}

export async function getEditPostByPostId(postId: string) {
	const user = await validateUser();
	const postEdit = await prisma.postEdit.findUnique({
		where: {
			postId_authorId: {
				postId,
				authorId: user.id,
			},
		},
		select: {
			id: true,
			postId: true,
			authorId: true,
			title: true,
			content: true,
			approvalStatus: true,
			createdAt: true,
			updatedAt: true,
			type: true,
			difficulty: true,
			companies: true,
			completionDuration: true,
			topics: true,
		},
	});

	if (postEdit?.content) {
		postEdit.content = JSON.parse(
			pako.inflate(postEdit.content, { to: "string" }),
		);
	}

	return postEdit;
}

export async function getAllApprovedPosts() {
	const posts = await prisma.post.findMany({
		where: {
			approvalStatus: PostApprovalStatus.APPROVED,
		},
		select: {
			slug: true,
			id: true,
			category: true,
			subCategory: true,
			content: true, // Include content if needed
		},
	});

	return posts.map((post) => {
		if (post.content) {
			post.content = JSON.parse(pako.inflate(post.content, { to: "string" }));
		}
		return post;
	});
}
