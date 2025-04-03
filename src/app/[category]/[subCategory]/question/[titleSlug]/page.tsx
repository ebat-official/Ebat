// app/posts/[titleSlug]/page.tsx
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { POST_ID_LENGTH } from "@/config";
import { PostApprovalStatus } from "@prisma/client";
import {
	generatePageMetadata,
	generateStructuredData,
	PostWithAuthor,
} from "@/utils/metadata";

// Generate static paths at build time
export async function generateStaticParams() {
	const posts = await prisma.post.findMany({
		where: {
			approvalStatus: PostApprovalStatus.APPROVED,
		},
		select: { slug: true, id: true },
	});

	return posts.map((post) => ({
		titleSlug: `${post.slug}-${post.id}`,
	}));
}

// Fetch post data
async function getPost(params: { titleSlug: string }) {
	const { titleSlug } = params;

	if (!titleSlug || typeof titleSlug !== "string") {
		return null;
	}

	const id = titleSlug.slice(-POST_ID_LENGTH);

	if (!id) {
		return null;
	}

	return await prisma.post.findUnique({
		where: { id },
		include: {
			author: {
				select: {
					name: true,
				},
			},
		},
	});
}

// Generate metadata
export async function generateMetadata({
	params,
}: {
	params: { titleSlug: string };
}): Promise<Metadata> {
	const post = await getPost(params);
	if (!post) return {};

	return generatePageMetadata(post as PostWithAuthor, {
		urlPrefix: "/questions",
	});
}

// Structured data component
function StructuredData({ post }: { post: PostWithAuthor }) {
	const structuredData = generateStructuredData(post, {
		urlPrefix: "/questions",
	});

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
		/>
	);
}

// Main page component
export default async function PostPage({
	params,
}: {
	params: { titleSlug: string };
}) {
	const post = await getPost(params);
	if (!post) return notFound();

	return (
		<>
			<StructuredData post={post as PostWithAuthor} />
			<article className="max-w-3xl mx-auto py-8 px-4">
				<header className="mb-8">
					<h1 className="text-3xl font-bold">{post.title}</h1>
					{post.author && (
						<p className="text-gray-600 mt-2">By {post.author.name}</p>
					)}
				</header>
				<section className="prose dark:prose-invert max-w-none">helloo</section>
			</article>
		</>
	);
}

// Revalidation settings (ISR)
export const revalidate = 60;
