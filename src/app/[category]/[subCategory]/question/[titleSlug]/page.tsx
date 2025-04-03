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

// Enhanced Type definitions
interface PageParams {
	category: string;
	subCategory: string;
	titleSlug: string;
}

interface PostQueryResult {
	slug: string;
	id: string;
	category: PostCategory;
	subCategory: SubCategory | null;
}

// Generate static paths
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

// Enhanced category validation with type guards
// function isValidCategoryCombo(
//   category: string,
//   subCategory: string | null
// ): category is PostCategory {
//   const validCombinations: Record<PostCategory, SubCategory[]> = {
//     [PostCategory.FRONTEND]: [
//       SubCategory.JAVASCRIPT,
//       SubCategory.HTML,
//       SubCategory.CSS,
//       SubCategory.REACT,
//     ],
//     [PostCategory.BACKEND]: [],
//     [PostCategory.ANDROID]: [],
//   };

//   const categoryEnum = Object.values(PostCategory).find(
//     (c) => c.toLowerCase() === category.toLowerCase()
//   ) as PostCategory | undefined;

//   if (!categoryEnum) return false;

//   // If no subcategories defined for this category
//   if (validCombinations[categoryEnum].length === 0) return true;

//   const subCategoryEnum = subCategory
//     ? (Object.values(SubCategory).find(
//         (sc) => sc.toLowerCase() === subCategory.toLowerCase()
//       ) as SubCategory | undefined)
//     : null;

//   return subCategoryEnum
//     ? validCombinations[categoryEnum].includes(subCategoryEnum)
//     : false;
// }

// Enhanced post fetching with proper typing
async function getPost(params: PageParams): Promise<PostWithAuthor | null> {
	const { titleSlug, category, subCategory } = params;

	// if (!isValidCategoryCombo(category, subCategory)) {
	//   return null;
	// }

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

// Metadata generation with enhanced typing
export async function generateMetadata({
	params,
}: {
	params: PageParams;
}): Promise<Metadata> {
	const post = await getPost(params);
	if (!post) return {};

	return generatePageMetadata(post, {
		urlPrefix: `/${params.category}/${params.subCategory}`,
	});
}

// Structured data component with security enhancements
// function StructuredData({
//   post,
//   category,
//   subCategory,
// }: {
//   post: PostWithAuthor;
//   category: string;
//   subCategory: string;
// }) {
//   const structuredData = generateStructuredData(post, {
//     urlPrefix: `/${category}/${subCategory}`,
//   });

//   return (
//     <script
//       type="application/ld+json"
//       dangerouslySetInnerHTML={{
//         __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
//       }}
//     />
//   );
// }

// Main page component with view count increment
export default async function Page({
	params,
}: {
	params: { category: string; subCategory: string; titleSlug: string };
}) {
	const post = await getPost(params);
	if (!post) return notFound();

	return (
		<>
			{/* <StructuredData
        post={post}
        category={params.category}
        subCategory={params.subCategory}
      /> */}
			<article className="max-w-3xl mx-auto py-8 px-4">
				<header className="mb-8">
					<div className="flex gap-2 mb-2">
						<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
							{params.category}
						</span>
						{params.subCategory && params.subCategory !== "general" && (
							<span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
								{params.subCategory}
							</span>
						)}
					</div>
					<h1 className="text-3xl font-bold">{post.title}</h1>
				</header>
				<section className="prose dark:prose-invert max-w-none">
					{/* Post content would be rendered here */}
				</section>
			</article>
		</>
	);
}

// ISR with explicit dynamic params control
export const revalidate = 60;
