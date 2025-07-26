import { getPostFromURL, getPostEditFromId } from "@/utils/api utils/posts";
import { notFound } from "next/navigation";
import PostView from "@/components/post view/PostView";
import { PostWithExtraDetails } from "@/utils/types";

interface PageProps {
	params: Promise<{ postId: string[] }>;
	searchParams: Promise<{ user?: string; edited?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;
	const postId = Array.isArray(awaitedParams.postId)
		? awaitedParams.postId[0]
		: awaitedParams.postId;

	const user = awaitedSearchParams.user;
	const edited = awaitedSearchParams.edited;

	let post: PostWithExtraDetails | null = null;

	// If the other user is verifying edit
	if (edited === "true") {
		post = await getPostEditFromId(postId, {
			user: user || "",
			edited: "true",
		});
	} else {
		post = await getPostFromURL(postId);
	}

	if (!post) {
		return notFound();
	}

	return (
		<article>
			<PostView post={post} />
		</article>
	);
}
