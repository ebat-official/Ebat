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

// Type definitions
interface PageParams {
	category: PostCategory;
	subCategory: SubCategory;
	titleSlug: string;
}

// Generate static paths for all valid category combinations
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

// Validate category and subCategory combination
function isValidCategoryCombo(
	category: string,
	subCategory: string | null,
): boolean {
	const validCombinations: Record<PostCategory, SubCategory[]> = {
		[PostCategory.FRONTEND]: [
			SubCategory.JAVASCRIPT,
			SubCategory.HTML,
			SubCategory.CSS,
			SubCategory.REACT,
		],
		[PostCategory.BACKEND]: [], // Add backend subcategories if needed
		[PostCategory.ANDROID]: [], // Add android subcategories if needed
	};

	// Convert to enum values
	const categoryEnum = Object.values(PostCategory).find(
		(c) => c.toLowerCase() === category.toLowerCase(),
	);

	const subCategoryEnum = subCategory
		? Object.values(SubCategory).find(
				(sc) => sc.toLowerCase() === subCategory.toLowerCase(),
			)
		: null;

	if (!categoryEnum) return false;

	// If no subcategory required for this category
	if (validCombinations[categoryEnum].length === 0) return true;

	return subCategoryEnum
		? validCombinations[categoryEnum].includes(subCategoryEnum)
		: false;
}

// Fetch post data with category validation
async function getPost(params: PageParams) {
	const { titleSlug, category, subCategory } = params;

	if (!isValidCategoryCombo(category, subCategory)) {
		return null;
	}

	const id = titleSlug.slice(-POST_ID_LENGTH);
	if (!id) return null;

	return await prisma.post.findUnique({
		where: {
			id,
			category: category.toUpperCase() as PostCategory,
			...(subCategory && {
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
}

// Generate metadata with proper category paths
export async function generateMetadata({
	params,
}: {
	params: PageParams;
}): Promise<Metadata> {
	const post = await getPost(params);
	if (!post) return {};

	return generatePageMetadata(post as PostWithAuthor, {
		urlPrefix: `/${params.category}/${params.subCategory}`,
	});
}

// Structured data component with category context
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
			dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
		/>
	);
}

// Main page component
export default async function PostPage({ params }: { params: PageParams }) {
	const post = await getPost(params);
	if (!post) return notFound();

	return (
		<>
			<StructuredData
				post={post as PostWithAuthor}
				category={params.category}
				subCategory={params.subCategory}
			/>
			<article className="max-w-3xl mx-auto py-8 px-4">
				<header className="mb-8">
					<div className="flex gap-2 mb-2">
						<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
							{params.category}
						</span>
						{params.subCategory && (
							<span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
								{params.subCategory}
							</span>
						)}
					</div>
					<h1 className="text-3xl font-bold">{post.title}</h1>
				</header>
				<section className="prose dark:prose-invert max-w-none">
					{/* Your post content would be rendered here */}
				</section>
			</article>
		</>
	);
}

// Revalidation settings (ISR)
export const revalidate = 60;
