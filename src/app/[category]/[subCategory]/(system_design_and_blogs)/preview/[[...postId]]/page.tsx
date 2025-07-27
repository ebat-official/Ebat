import { getPostFromURL, getPostEditFromId } from "@/utils/api utils/posts";
import { notFound } from "next/navigation";
import PostView from "@/components/post view/PostView";
import DiffViewer from "@/components/post view/diff/DiffViewer";
import DiffToggleButton from "@/components/post view/diff/DiffToggleButton";
import { PostWithExtraDetails } from "@/utils/types";

interface PageProps {
	params: Promise<{ postId: string[] }>;
	searchParams: Promise<{ user?: string; edited?: string; diffview?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;
	const postId = Array.isArray(awaitedParams.postId)
		? awaitedParams.postId[0]
		: awaitedParams.postId;

	const user = awaitedSearchParams.user;
	const edited = awaitedSearchParams.edited;
	const diffview = awaitedSearchParams.diffview;

	let post: PostWithExtraDetails | null = null;
	let originalPost: PostWithExtraDetails | null = null;

	// If the other user is verifying edit
	if (edited === "true") {
		post = await getPostEditFromId(postId, {
			user: user || "",
			edited: "true",
		});
		// Get the original post for comparison only if diff view is requested
		if (diffview === "true") {
			originalPost = await getPostFromURL(postId);
		}
	} else {
		post = await getPostFromURL(postId);
	}

	if (!post) {
		return notFound();
	}

	// Show diff view if requested and we have both original and modified posts
	if (diffview === "true" && edited === "true" && originalPost) {
		return (
			<article>
				<div className="flex justify-end mb-4">
					<DiffToggleButton postId={postId} />
				</div>
				<DiffViewer originalPost={originalPost} modifiedPost={post} />
			</article>
		);
	}

	return (
		<article>
			{edited === "true" && (
				<div className="flex justify-end mb-4 ">
					<DiffToggleButton postId={postId} />
				</div>
			)}
			<PostView post={post} />
		</article>
	);
}
