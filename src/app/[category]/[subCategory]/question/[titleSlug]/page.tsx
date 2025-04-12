// app/[category]/[subCategory]/(system_design_and_blogs)/[titleSlug]/page.tsx
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { POST_ID_LENGTH } from "@/config";
import { PostApprovalStatus, PostCategory, SubCategory } from "@prisma/client";
import {
	generatePageMetadata,
	generateStructuredData,
	PostWithAuthor,
} from "@/utils/metadata";
import { ContentType } from "@/utils/types";
import PostView from "@/components/main/PostView"; // Directly import PostView
import { isValidCategoryCombo } from "@/utils/isValidCategoryCombo";

// Updated Type definitions for Next.js 15
type PageParams = Promise<{
	category: string;
	subCategory: string;
	titleSlug: string;
}>;

// Generate static paths (unchanged)
export async function generateStaticParams() {
	const posts = await prisma.post.findMany({
		where: {
			approvalStatus: PostApprovalStatus.APPROVED,
		},
		select: {
			slug: true,
			id: true,
			category: true,
			subCategory: true,
		},
	});

	return posts.map((post) => ({
		category: post.category.toLowerCase(),
		subCategory: post.subCategory?.toLowerCase() ?? "general",
		titleSlug: `${post.slug}-${post.id}`,
	}));
}

// Enhanced post fetching with proper typing (updated params type)
async function getPost(params: {
	category: string;
	subCategory: string;
	titleSlug: string;
}): Promise<PostWithAuthor | null> {
	const { titleSlug, category, subCategory } = params;

	if (!isValidCategoryCombo(category, subCategory)) {
		return null;
	}

	const id = titleSlug.slice(-POST_ID_LENGTH);
	if (!id) return null;

	try {
		return await prisma.post.findUnique({
			where: {
				id,
				category: category.toUpperCase() as PostCategory,
				...(subCategory &&
					subCategory !== "general" && {
						subCategory: subCategory.toUpperCase() as SubCategory,
					}),
			},
			include: {
				author: {
					select: {
						name: true,
					},
				},
			},
		});
	} catch (error) {
		console.error("Error fetching post:", error);
		return null;
	}
}

// Metadata generation with updated typing for Next.js 15
export async function generateMetadata({
	params,
}: {
	params: PageParams;
}): Promise<Metadata> {
	const awaitedParams = await params;
	const post = await getPost(awaitedParams);
	if (!post) return {};

	return generatePageMetadata(post, {
		urlPrefix: `/${awaitedParams.category}/${awaitedParams.subCategory}`,
	});
}

// Structured data component (unchanged)
function StructuredData({
	post,
	category,
	subCategory,
}: {
	post: PostWithAuthor;
	category: string;
	subCategory: string;
}) {
	const structuredData = generateStructuredData(post, {
		urlPrefix: `/${category}/${subCategory}`,
	});

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
			}}
		/>
	);
}

// Main page component updated for Next.js 15
export default async function PostPage({ params }: { params: PageParams }) {
	const awaitedParams = await params;
	const post = await getPost(awaitedParams);
	if (!post) return notFound();

	return (
		<>
			<StructuredData
				post={post}
				category={awaitedParams.category}
				subCategory={awaitedParams.subCategory}
			/>
			<article>
				<PostView post={post} />
			</article>
		</>
	);
}

// ISR configuration remains the same
export const revalidate = "1d";
