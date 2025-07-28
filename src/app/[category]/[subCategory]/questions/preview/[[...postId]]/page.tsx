import { getPostFromURL, getPostEditFromId } from "@/utils/api utils/posts";
import { notFound } from "next/navigation";
import UnifiedPreview from "@/components/post view/diff/UnifiedPreview";
import PostView from "@/components/post view/PostView";
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

	return (
		<UnifiedPreview
			post={post}
			originalPost={originalPost}
			postId={postId}
			isEdited={edited === "true"}
			showDiff={diffview === "true"}
			componentSlot={<PostView post={post} />}
			componentType="post"
		/>
	);
}
