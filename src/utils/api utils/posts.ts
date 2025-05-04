import pako from "pako";
import { validateUser } from "@/actions/user";
import { UNAUTHENTICATED_ERROR } from "../errors";
import prisma from "@/lib/prisma";
import { SUCCESS } from "../contants";
import { PostApprovalStatus } from "@prisma/client";

export async function getPostById(postId: string) {
	const post = await prisma.post.findUnique({
		where: { id: postId },
	});

	if (post?.content) {
		post.content = JSON.parse(pako.inflate(post.content, { to: "string" }));
	}
	return post;
}

export async function getEditPostByPostId(postId: string) {
	const user = await validateUser();

	if (!user) return null;
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
