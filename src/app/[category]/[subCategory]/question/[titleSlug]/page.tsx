import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { generatePageMetadata } from "@/utils/metadata";
import PostView from "@/components/shared/Post View/PostView";
import { getPostFromURL } from "@/utils/apiUtils";
import { PageParams } from "@/utils/types";
import { getAllApprovedPosts } from "@/actions/post";
import { generatePostPathFromPostId } from "@/utils/generatePostPath";
import StructuredMetaData from "@/components/shared/StructuredMetaData";
import { findUserProfile } from "@/actions/userProfile";
import { UserProfile } from "@prisma/client";

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
	const userProfile = await findUserProfile(post.authorId);
	return (
		<>
			<StructuredMetaData post={post} />
			<article>
				<PostView post={post} userProfile={userProfile as UserProfile} />
			</article>
		</>
	);
}

// automatic ISR configuration (fallback)
export const revalidate = 86400; // Revalidate every 1 day
