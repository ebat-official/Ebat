"use server";
import { auth } from "@/auth";
import { db } from "@/db";
import {
	challengeTemplates,
	postEdits,
	posts,
	postContributors,
} from "@/db/schema";
import {
	PostApprovalStatus,
	PostStatus,
	PostStatusType,
	PostType,
} from "@/db/schema/enums";
import { InsertPost, InsertPostEdit } from "@/db/schema/zod-schemas";
import { PostDraftValidator, PostValidator } from "@/lib/validators/post";
import { compressContent } from "@/utils/compression";
import { ERROR, POST_ID_REQUIRED, SUCCESS } from "@/utils/constants";
import {
	FailedToEditPostErr,
	LIVE_POST_EDIT_ERROR,
	UNAUTHENTICATED_ERROR,
	UNAUTHORIZED_ERROR,
	ValidationErr,
} from "@/utils/errors";
import { generatePostPath } from "@/utils/generatePostPath";
import { generateTitleSlug } from "@/utils/generateTileSlug";
import { getCompletionDuration } from "@/utils/getCompletionDuration";
import { getDefaultCoins } from "@/utils/getDefaultCoins";
import { DatabaseJson, GenerateActionReturnType } from "@/utils/types";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { validateUser } from "./user";
type PostReturnType = {
	id: string;
	slug: string | null;
	approvalStatus: PostApprovalStatus;
};
const getPostDetails = async (postId: string) => {
	return await db.query.posts.findFirst({
		where: eq(posts.id, postId),
		columns: {
			authorId: true,
			status: true,
			approvalStatus: true,
		},
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

const revalidatePostPath = (post: typeof posts.$inferSelect) => {
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
	status: PostStatusType = PostStatus.PUBLISHED,
): InsertPost => ({
	id: data.id,
	authorId: user.id,
	status,
	title: data.title || null,
	content: data.content ? compressContent(data.content) : null,
	type: data.type,
	difficulty: data.difficulty,
	companies: data.companies?.map((company) => company.toLowerCase()) || [],
	completionDuration: data.completionDuration || null,
	topics: data.topics?.map((topic) => topic.toLowerCase()) || [],
	category: data.category,
	subCategory: data.subCategory,
	thumbnail: data.thumbnail || null,
});

// Draft Post Creation
export async function createDraftPost(
	data: z.infer<typeof PostDraftValidator>,
): Promise<GenerateActionReturnType<PostReturnType>> {
	const validation = PostDraftValidator.safeParse(data);
	if (!validation.success) return { status: ERROR, data: validation.error };

	const user = await validateUser();

	if (!user) return UNAUTHENTICATED_ERROR;
	if (!data.id) return ValidationErr(POST_ID_REQUIRED);
	const isOwner = await checkPostOwnership(data.id, user.id);
	if (!isOwner) return UNAUTHORIZED_ERROR;

	const postData = {
		...buildBasePostData(user, data, PostStatus.DRAFT),
		approvalStatus: PostApprovalStatus.PENDING,
		logs: [],
	};

	// Handle challenge templates for drafts (optional)
	if (
		data.type === PostType.CHALLENGE &&
		data.challengeTemplates &&
		data.challengeTemplates.length > 0
	) {
		try {
			const result = await db.transaction(async (tx) => {
				// Create the post
				const post = await tx
					.insert(posts)
					.values(postData)
					.onConflictDoUpdate({
						target: posts.id,
						set: postData,
					})
					.returning();

				// Delete all existing templates for this post
				await tx
					.delete(challengeTemplates)
					.where(eq(challengeTemplates.postId, post[0].id));

				// Create all new templates
				if (data.challengeTemplates) {
					for (const template of data.challengeTemplates) {
						await tx.insert(challengeTemplates).values({
							postId: post[0].id,
							framework: template.framework,
							questionTemplate: template.questionTemplate,
							answerTemplate: template.answerTemplate,
						});
					}
				}

				return post[0];
			});

			return {
				status: SUCCESS,
				data: {
					id: result.id,
					slug: null,
					approvalStatus: result.approvalStatus,
				},
			};
		} catch (e) {
			return {
				status: ERROR,
				data: { message: "Failed to create challenge draft with templates" },
			};
		}
	} else {
		// Regular draft creation without challenge templates
		const post = await db
			.insert(posts)
			.values(postData)
			.onConflictDoUpdate({
				target: posts.id,
				set: postData,
			})
			.returning();
		return {
			status: SUCCESS,
			data: {
				id: post[0].id,
				slug: null,
				approvalStatus: post[0].approvalStatus,
			},
		};
	}
}

// Published Post Creation
export async function createPost(
	data: z.infer<typeof PostValidator>,
): Promise<GenerateActionReturnType<PostReturnType>> {
	const validation = PostValidator.safeParse(data);
	if (!validation.success) return { status: ERROR, data: validation.error };

	const user = await validateUser();

	if (!user) return UNAUTHENTICATED_ERROR;
	if (!data.id) return ValidationErr(POST_ID_REQUIRED);
	//return true if post not exists or owner is current user
	const isOwner = await checkPostOwnership(data.id, user.id);
	if (!isOwner) return UNAUTHORIZED_ERROR;

	const { isLivePost } = await checkPostLiveStatus(data.id); // Only allow updates if the post is not in LIVE status except for blogs
	if (isLivePost && data.type !== PostType.BLOGS) {
		return LIVE_POST_EDIT_ERROR;
	}

	const postData = {
		...buildBasePostData(user, data),
		title: data.title,
		completionDuration: getCompletionDuration(data),
		coins: getDefaultCoins(data),
		approvalStatus:
			data.type === PostType.BLOGS
				? PostApprovalStatus.APPROVED
				: PostApprovalStatus.PENDING,
		logs: [],
		slug: generateTitleSlug(data.title),
	};

	// Handle challenge templates in transaction
	if (
		data.type === PostType.CHALLENGE &&
		data.challengeTemplates &&
		data.challengeTemplates.length > 0
	) {
		try {
			const result = await db.transaction(async (tx) => {
				// Create the post
				const post = await tx
					.insert(posts)
					.values(postData)
					.onConflictDoUpdate({
						target: posts.id,
						set: postData,
					})
					.returning();

				// Delete all existing templates for this post
				await tx
					.delete(challengeTemplates)
					.where(eq(challengeTemplates.postId, post[0].id));

				// Create all new templates
				if (data.challengeTemplates) {
					for (const template of data.challengeTemplates) {
						await tx.insert(challengeTemplates).values({
							postId: post[0].id,
							framework: template.framework,
							questionTemplate: template.questionTemplate,
							answerTemplate: template.answerTemplate,
						});
					}
				}

				return post[0];
			});

			// Trigger revalidation for the post's path
			revalidatePostPath(result);
			return {
				status: SUCCESS,
				data: {
					id: result.id,
					slug: result.slug,
					approvalStatus: result.approvalStatus,
				},
			};
		} catch (e) {
			return {
				status: ERROR,
				data: { message: "Failed to create challenge post with templates" },
			};
		}
	} else {
		// Regular post creation without challenge templates
		const post = await db
			.insert(posts)
			.values(postData)
			.onConflictDoUpdate({
				target: posts.id,
				set: postData,
			})
			.returning();

		// Trigger revalidation for the post's path
		revalidatePostPath(post[0]);
		return {
			status: SUCCESS,
			data: {
				id: post[0].id,
				slug: post[0].slug,
				approvalStatus: post[0].approvalStatus,
			},
		};
	}
}

export async function createPostEdit(
	data: z.infer<typeof PostValidator>,
	postStatus: PostStatusType = PostStatus.PUBLISHED,
): Promise<GenerateActionReturnType<PostReturnType>> {
	// Validate the input data
	const validation = PostValidator.safeParse(data);
	if (!validation.success) return { status: ERROR, data: validation.error };

	const { isLivePost, existingPost } = await checkPostLiveStatus(data.id);
	// Only allow updates if the post is in LIVE status
	if (!existingPost) {
		return FailedToEditPostErr("The post does not exist.");
	}

	if (!isLivePost) {
		return FailedToEditPostErr("Only live posts can be edited.");
	}

	const user = await validateUser();
	if (!user) return UNAUTHENTICATED_ERROR;

	const baseData = buildBasePostData(user, data, postStatus);
	const postEditData: InsertPostEdit = {
		postId: data.id,
		authorId: baseData.authorId,
		title: baseData.title,
		content: baseData.content,
		type: baseData.type,
		difficulty: baseData.difficulty,
		companies: baseData.companies,
		completionDuration: baseData.completionDuration,
		topics: baseData.topics,
		thumbnail: baseData.thumbnail,
		category: baseData.category,
		subCategory: baseData.subCategory,
		logs: [],
		status: baseData.status,
	};

	let createdPostEdit: typeof postEdits.$inferSelect;

	// Handle challenge templates for post edits
	if (
		data.type === PostType.CHALLENGE &&
		data.challengeTemplates &&
		data.challengeTemplates.length > 0
	) {
		try {
			const result = await db.transaction(async (tx) => {
				// Create the post edit
				const postEdit = await tx
					.insert(postEdits)
					.values(postEditData)
					.onConflictDoUpdate({
						target: [postEdits.postId, postEdits.authorId],
						set: postEditData,
					})
					.returning();

				// Delete all existing templates for this post edit
				await tx
					.delete(challengeTemplates)
					.where(eq(challengeTemplates.postEditId, postEdit[0].id));

				// Create all new templates with postEditId mapping
				if (data.challengeTemplates) {
					for (const template of data.challengeTemplates) {
						await tx.insert(challengeTemplates).values({
							postEditId: postEdit[0].id, // New post edit ID
							framework: template.framework,
							questionTemplate: template.questionTemplate,
							answerTemplate: template.answerTemplate,
						});
					}
				}

				return postEdit[0];
			});

			createdPostEdit = result;
		} catch (e) {
			return {
				status: ERROR,
				data: {
					message: "Failed to create challenge post edit with templates",
				},
			};
		}
	} else {
		// Regular post edit creation without challenge templates
		const postEdit = await db
			.insert(postEdits)
			.values(postEditData)
			.onConflictDoUpdate({
				target: [postEdits.postId, postEdits.authorId],
				set: postEditData,
			})
			.returning();

		createdPostEdit = postEdit[0];
	}

	// Special case: For BLOGS posts, if the user is the author, auto-approve the edit
	if (
		data.type === PostType.BLOGS &&
		existingPost.authorId === user.id &&
		postStatus === PostStatus.PUBLISHED
	) {
		// Import the auto-approval function
		const { autoApprovePostEdit } = await import("./approval");
		await autoApprovePostEdit(createdPostEdit.id);
	}

	return {
		status: SUCCESS,
		data: {
			id: createdPostEdit.postId,
			slug: "",
			approvalStatus: createdPostEdit.approvalStatus,
		},
	};
}

// Delete Post Action
export async function deletePost(
	postId: string,
): Promise<GenerateActionReturnType<{ success: boolean }>> {
	try {
		const user = await validateUser();
		if (!user) return UNAUTHENTICATED_ERROR;

		// Get post details to check ownership
		const post = await db.query.posts.findFirst({
			where: eq(posts.id, postId),
		});

		if (!post) {
			return {
				status: ERROR,
				data: { message: "Post not found" },
			};
		}

		// Check if user is the author
		const isAuthor = post.authorId === user.id;

		// If not the owner, check if user has "delete" permission
		if (!isAuthor) {
			const hasDeletePermission = await auth.api.userHasPermission({
				body: {
					userId: user.id,
					permission: { post: ["delete"] },
				},
			});
			if (!hasDeletePermission?.success) {
				return UNAUTHORIZED_ERROR;
			}
		}

		// Delete the post and all related data in a transaction
		await db.transaction(async (tx) => {
			// Delete challenge templates only if post type is challenge
			if (post.type === PostType.CHALLENGE) {
				await tx
					.delete(challengeTemplates)
					.where(eq(challengeTemplates.postId, postId));
			}

			// Delete the post (cascade will handle postEdits, postContributors, postViews, etc.)
			await tx.delete(posts).where(eq(posts.id, postId));
		});

		// Revalidate the post path for cache
		revalidatePostPath(post);

		return {
			status: SUCCESS,
			data: { success: true },
		};
	} catch (error) {
		console.error("Error deleting post:", error);
		return {
			status: ERROR,
			data: { message: "Failed to delete post" },
		};
	}
}

// Delete Post Edit Action
export async function deletePostEdit(
	postEditId: string,
): Promise<GenerateActionReturnType<{ success: boolean }>> {
	try {
		const user = await validateUser();
		if (!user) return UNAUTHENTICATED_ERROR;

		// Get post edit details to check ownership
		const postEdit = await db.query.postEdits.findFirst({
			where: eq(postEdits.id, postEditId),
		});

		if (!postEdit) {
			return {
				status: ERROR,
				data: { message: "Post edit not found" },
			};
		}

		// Check if user is the author or has delete permission
		const isAuthor = postEdit.authorId === user.id;

		// If not the owner, check if user has "delete" permission
		if (!isAuthor) {
			const hasDeletePermission = await auth.api.userHasPermission({
				body: {
					userId: user.id,
					permission: { post: ["delete"] },
				},
			});
			if (!hasDeletePermission?.success) {
				return UNAUTHORIZED_ERROR;
			}
		}

		// Delete the post edit and related data in a transaction
		await db.transaction(async (tx) => {
			// Delete challenge templates for this post edit
			await tx
				.delete(challengeTemplates)
				.where(eq(challengeTemplates.postEditId, postEditId));

			// Delete the post edit
			await tx.delete(postEdits).where(eq(postEdits.id, postEditId));
		});

		return {
			status: SUCCESS,
			data: { success: true },
		};
	} catch (error) {
		console.error("Error deleting post edit:", error);
		return {
			status: ERROR,
			data: { message: "Failed to delete post edit" },
		};
	}
}
