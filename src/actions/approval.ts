"use server";

import { hasModeratorAccess } from "@/auth/roleUtils";
import { db } from "@/db";
import {
	challengeTemplates,
	postContributors,
	postEdits,
	posts,
} from "@/db/schema";
import { PostApprovalStatus, PostStatus, UserRole } from "@/db/schema/enums";
import { InsertPost } from "@/db/schema/zod-schemas";
import { compressContent, decompressContent } from "@/utils/compression";
import { ERROR, SUCCESS } from "@/utils/constants";
import {
	UNAUTHENTICATED_ERROR,
	UNAUTHORIZED_ERROR,
	RATE_LIMIT_ERROR,
} from "@/utils/errors";
import { generatePostPath } from "@/utils/generatePostPath";
import { DatabaseJson, GenerateActionReturnType } from "@/utils/types";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { validateUser } from "./user";
import { rateLimit, ContentActions, RateLimitCategory } from "@/lib/rateLimit";
import { KarmaAction } from "@/db/schema/enums";
import { awardKarma, getKarmaAmount } from "@/utils/karmaUtils";

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

// Approve Post Edit Action
export async function approvePostEdit(
	postEditId: string,
	isAutoApproval = false,
): Promise<GenerateActionReturnType<{ success: boolean }>> {
	// Rate limiting
	const rateLimitResult = await rateLimit(
		RateLimitCategory.CONTENT,
		ContentActions.EDIT_POST,
	);
	if (!rateLimitResult.success) {
		return RATE_LIMIT_ERROR;
	}

	try {
		const user = await validateUser();
		if (!user) return UNAUTHENTICATED_ERROR;

		// For manual approval, check if user has edit-read permission (admin/moderator only)
		if (!isAutoApproval && !hasModeratorAccess(user.role as UserRole)) {
			return UNAUTHORIZED_ERROR;
		}

		// Get post edit with all necessary data
		const postEdit = await db.query.postEdits.findFirst({
			where: eq(postEdits.id, postEditId),
			with: {
				challengeTemplates: true,
			},
		});

		if (!postEdit) {
			return {
				status: ERROR,
				data: { message: "Post edit not found" },
			};
		}

		if (postEdit.approvalStatus !== PostApprovalStatus.PENDING) {
			return {
				status: ERROR,
				data: { message: "Post edit is not pending approval" },
			};
		}

		if (postEdit.status !== PostStatus.PUBLISHED) {
			return {
				status: ERROR,
				data: { message: "Only published post edits can be approved" },
			};
		}

		// Get original post with current data
		const originalPost = await db.query.posts.findFirst({
			where: eq(posts.id, postEdit.postId),
			with: {
				challengeTemplates: true,
			},
		});

		if (!originalPost) {
			return {
				status: ERROR,
				data: { message: "Original post not found" },
			};
		}

		if (originalPost.approvalStatus !== PostApprovalStatus.APPROVED) {
			return {
				status: ERROR,
				data: { message: "Only approved posts can be edited" },
			};
		}

		// For auto-approval, verify the user is the author of the original post
		if (isAutoApproval && postEdit.authorId !== originalPost.authorId) {
			return {
				status: ERROR,
				data: {
					message: "Only the original author can auto-approve their own edits",
				},
			};
		}

		// Build updated post data - only update fields that have data in the edit
		const updatedPostData: Partial<InsertPost> = {
			title: postEdit.title || originalPost.title,
			content: postEdit.content || originalPost.content,
			type: postEdit.type,
			difficulty: postEdit.difficulty || originalPost.difficulty,
			companies: postEdit.companies || originalPost.companies,
			completionDuration:
				postEdit.completionDuration || originalPost.completionDuration,
			topics: postEdit.topics || originalPost.topics,
			thumbnail: postEdit.thumbnail || originalPost.thumbnail,
			category: postEdit.category,
			subCategory: postEdit.subCategory,
			// Preserve original ID
			id: originalPost.id,
		};

		// Execute all updates in a transaction
		const result = await db.transaction(async (tx) => {
			// Update the original post
			const updatedPost = await tx
				.update(posts)
				.set(updatedPostData)
				.where(eq(posts.id, originalPost.id))
				.returning();

			// Handle challenge templates if post type is CHALLENGE
			if (postEdit.type === "challenge" && postEdit.challengeTemplates) {
				// Use a single operation: delete all existing templates and insert new ones
				await tx.transaction(async (templateTx) => {
					await templateTx
						.delete(challengeTemplates)
						.where(eq(challengeTemplates.postId, originalPost.id));

					if (postEdit.challengeTemplates.length > 0) {
						await templateTx.insert(challengeTemplates).values(
							postEdit.challengeTemplates.map((template) => ({
								postId: originalPost.id,
								framework: template.framework,
								questionTemplate: template.questionTemplate,
								answerTemplate: template.answerTemplate,
							})),
						);
					}
				});
			}

			// Add edit author as contributor if not already contributor and not original author
			const editAuthorId = postEdit.authorId;
			const originalAuthorId = originalPost.authorId;

			if (editAuthorId !== originalAuthorId) {
				// Use insert with ON CONFLICT DO NOTHING to avoid the extra query
				await tx
					.insert(postContributors)
					.values({
						postId: originalPost.id,
						userId: editAuthorId,
					})
					.onConflictDoNothing();
			}

			// Mark post edit as approved
			await tx
				.update(postEdits)
				.set({ approvalStatus: PostApprovalStatus.APPROVED })
				.where(eq(postEdits.id, postEditId));

			return updatedPost[0];
		});

		// Revalidate the post path for cache
		revalidatePostPath(result);

		// Award karma to both edit author and approver in a single transaction
		if (!isAutoApproval) {
			const editKarmaAmount = getKarmaAmount(KarmaAction.POST_EDIT_APPROVAL, {
				postType: originalPost.type,
			});
			const approverKarmaAmount = Math.ceil(editKarmaAmount / 2); // Half, rounded up

			// Use Promise.all for concurrent execution
			await Promise.all([
				// Award karma to the edit author
				awardKarma(
					postEdit.authorId,
					KarmaAction.POST_EDIT_APPROVAL,
					0, // Will be calculated based on post type
					{
						postId: originalPost.id,
						postType: originalPost.type,
						postTitle: originalPost.title,
						category: originalPost.category,
						subCategory: originalPost.subCategory,
						slug: originalPost.slug,
					},
				),
				// Award karma to the approver
				awardKarma(
					user.id,
					KarmaAction.POST_EDIT_APPROVAL,
					approverKarmaAmount,
					{
						postId: originalPost.id,
						postType: originalPost.type,
						postTitle: originalPost.title,
						category: originalPost.category,
						subCategory: originalPost.subCategory,
						slug: originalPost.slug,
						isApprover: true,
					},
				),
			]);
		}

		return {
			status: SUCCESS,
			data: { success: true },
		};
	} catch (error) {
		console.error("Error approving post edit:", error);
		return {
			status: ERROR,
			data: { message: "Failed to approve post edit" },
		};
	}
}

// Auto-approve Post Edit Action (for authors editing their own BLOGS posts)
export async function autoApprovePostEdit(postEditId: string) {
	return approvePostEdit(postEditId, true);
}

// Reject Post Edit Action
export async function rejectPostEdit(
	postEditId: string,
	reason?: string,
): Promise<GenerateActionReturnType<{ success: boolean }>> {
	// Rate limiting
	const rateLimitResult = await rateLimit(
		RateLimitCategory.CONTENT,
		ContentActions.EDIT_POST,
	);
	if (!rateLimitResult.success) {
		return RATE_LIMIT_ERROR;
	}
	try {
		const user = await validateUser();
		if (!user) return UNAUTHENTICATED_ERROR;

		// Check if user has edit-read permission (admin/moderator only)
		if (!hasModeratorAccess(user.role as UserRole)) {
			return UNAUTHORIZED_ERROR;
		}

		// Get post edit
		const postEdit = await db.query.postEdits.findFirst({
			where: eq(postEdits.id, postEditId),
		});

		if (!postEdit) {
			return {
				status: ERROR,
				data: { message: "Post edit not found" },
			};
		}

		if (postEdit.approvalStatus !== PostApprovalStatus.PENDING) {
			return {
				status: ERROR,
				data: { message: "Post edit is not pending approval" },
			};
		}

		if (postEdit.status !== PostStatus.PUBLISHED) {
			return {
				status: ERROR,
				data: { message: "Only published post edits can be rejected" },
			};
		}

		// Mark post edit as rejected with optional reason
		const rejectionLog = {
			action: "rejected",
			reason: reason || "No reason provided",
			rejectedBy: user.id,
			rejectedAt: new Date().toISOString(),
		};

		await db
			.update(postEdits)
			.set({
				approvalStatus: PostApprovalStatus.REJECTED,
				logs: [rejectionLog, ...((postEdit.logs as DatabaseJson[]) || [])],
			})
			.where(eq(postEdits.id, postEditId));

		return {
			status: SUCCESS,
			data: { success: true },
		};
	} catch (error) {
		console.error("Error rejecting post edit:", error);
		return {
			status: ERROR,
			data: { message: "Failed to reject post edit" },
		};
	}
}

// Approve New Post Action
export async function approvePost(
	postId: string,
): Promise<GenerateActionReturnType<{ success: boolean }>> {
	// Rate limiting
	const rateLimitResult = await rateLimit(
		RateLimitCategory.CONTENT,
		ContentActions.EDIT_POST,
	);
	if (!rateLimitResult.success) {
		return RATE_LIMIT_ERROR;
	}

	try {
		const user = await validateUser();
		if (!user) return UNAUTHENTICATED_ERROR;

		// Check if user has moderator access
		if (!hasModeratorAccess(user.role as UserRole)) {
			return UNAUTHORIZED_ERROR;
		}

		// Get post with all necessary data
		const post = await db.query.posts.findFirst({
			where: eq(posts.id, postId),
			with: {
				challengeTemplates: true,
			},
		});

		if (!post) {
			return {
				status: ERROR,
				data: { message: "Post not found" },
			};
		}

		if (post.approvalStatus !== PostApprovalStatus.PENDING) {
			return {
				status: ERROR,
				data: { message: "Post is not pending approval" },
			};
		}

		if (post.status !== PostStatus.PUBLISHED) {
			return {
				status: ERROR,
				data: { message: "Only published posts can be approved" },
			};
		}

		// Update post approval status
		await db
			.update(posts)
			.set({ approvalStatus: PostApprovalStatus.APPROVED })
			.where(eq(posts.id, postId));

		// Award karma to both author and approver in a single transaction
		if (post.authorId) {
			const postKarmaAmount = getKarmaAmount(KarmaAction.POST_APPROVAL, {
				postType: post.type,
			});
			const approverKarmaAmount = Math.ceil(postKarmaAmount / 2); // Half, rounded up

			// Use Promise.all for concurrent execution
			await Promise.all([
				// Award karma to the author
				awardKarma(
					post.authorId,
					KarmaAction.POST_APPROVAL,
					0, // Will be calculated based on post type
					{
						postId: post.id,
						postType: post.type,
						postTitle: post.title,
						category: post.category,
						subCategory: post.subCategory,
						slug: post.slug,
					},
				),
				// Award karma to the approver
				awardKarma(user.id, KarmaAction.POST_APPROVAL, approverKarmaAmount, {
					postId: post.id,
					postType: post.type,
					postTitle: post.title,
					category: post.category,
					subCategory: post.subCategory,
					slug: post.slug,
					isApprover: true,
				}),
			]);
		}

		// Revalidate the post path for cache
		revalidatePostPath(post);

		return {
			status: SUCCESS,
			data: { success: true },
		};
	} catch (error) {
		console.error("Error approving post:", error);
		return {
			status: ERROR,
			data: { message: "Failed to approve post" },
		};
	}
}

// Reject New Post Action
export async function rejectPost(
	postId: string,
	reason?: string,
): Promise<GenerateActionReturnType<{ success: boolean }>> {
	// Rate limiting
	const rateLimitResult = await rateLimit(
		RateLimitCategory.CONTENT,
		ContentActions.EDIT_POST,
	);
	if (!rateLimitResult.success) {
		return RATE_LIMIT_ERROR;
	}

	try {
		const user = await validateUser();
		if (!user) return UNAUTHENTICATED_ERROR;

		// Check if user has moderator access
		if (!hasModeratorAccess(user.role as UserRole)) {
			return UNAUTHORIZED_ERROR;
		}

		// Get post
		const post = await db.query.posts.findFirst({
			where: eq(posts.id, postId),
		});

		if (!post) {
			return {
				status: ERROR,
				data: { message: "Post not found" },
			};
		}

		if (post.approvalStatus !== PostApprovalStatus.PENDING) {
			return {
				status: ERROR,
				data: { message: "Post is not pending approval" },
			};
		}

		if (post.status !== PostStatus.PUBLISHED) {
			return {
				status: ERROR,
				data: { message: "Only published posts can be rejected" },
			};
		}

		// Mark post as rejected with optional reason
		const rejectionLog = {
			action: "rejected",
			reason: reason || "No reason provided",
			rejectedBy: user.id,
			rejectedAt: new Date().toISOString(),
		};

		await db
			.update(posts)
			.set({
				approvalStatus: PostApprovalStatus.REJECTED,
				logs: [rejectionLog, ...((post.logs as DatabaseJson[]) || [])],
			})
			.where(eq(posts.id, postId));

		return {
			status: SUCCESS,
			data: { success: true },
		};
	} catch (error) {
		console.error("Error rejecting post:", error);
		return {
			status: ERROR,
			data: { message: "Failed to reject post" },
		};
	}
}
