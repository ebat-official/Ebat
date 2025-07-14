import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { generatePageMetadata } from "@/utils/metadata";
import PostView from "@/components/post view/PostView";
import { getPostFromURL } from "@/utils/api utils/posts";
import { PageParams } from "@/utils/types";
import { getAllApprovedPosts } from "@/utils/api utils/posts";
import { generatePostPathFromPostId } from "@/utils/generatePostPath";
import StructuredMetaData from "@/components/shared/StructuredMetaData";
import DraggablePanel from "@/components/playground/DraggablePanel";

// incremental SSG,should be in the file
export async function generateStaticParams() {
	const posts = await getAllApprovedPosts();

	return posts.map((post) => ({
		category: post.category.toLowerCase(),
		subCategory: post.subCategory?.toLowerCase() ?? "general",
		titleSlug: `${post.slug}-${post.id}`,
	}));
}

// Metadata Next.js 15 , should be in the file
export async function generateMetadata({
	params,
}: {
	params: PageParams;
}): Promise<Metadata> {
	const awaitedParams = await params;
	const post = await getPostFromURL(awaitedParams);
	if (!post) return {};

	return generatePageMetadata(post, {
		url: generatePostPathFromPostId(post),
	});
}

// Main page component updated for Next.js 15
export default async function PostPage({ params }: { params: PageParams }) {
	const awaitedParams = await params;
	const post = await getPostFromURL(awaitedParams);
	if (!post) return notFound();
	return (
		<>
			<StructuredMetaData post={post} />
			<DraggablePanel post={post} />
		</>
	);
}

// automatic ISR configuration (fallback)
export const revalidate = 86400; // Revalidate every 1 day
