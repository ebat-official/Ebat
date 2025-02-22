import { UNKNOWN_ERROR } from "@/utils/contants";
import { ContentType } from "@/utils/types";
import { Post } from "@prisma/client";
import {
	useQuery,
	useQueryClient,
	UseQueryOptions,
	UseQueryResult,
} from "@tanstack/react-query";

type PostWithContent = Post & { content: ContentType };

const fetchPostDraftById = async (postId: string): Promise<PostWithContent> => {
	if (!postId) throw new Error("Post ID is required");

	const res = await fetch(`/api/posts/drafts/${postId}`);

	if (!res.ok) {
		let errorMessage = UNKNOWN_ERROR;
		try {
			const errorData = await res.json();
			errorMessage = errorData?.data?.message || UNKNOWN_ERROR;
		} catch {}
		throw new Error(errorMessage);
	}

	const post = await res.json();
	return { ...post, content: post.content as ContentType };
};

export function usePostDraft(
	postId: string | undefined,
	options?: Partial<UseQueryOptions<PostWithContent, Error>>,
): UseQueryResult<PostWithContent, Error> {
	return useQuery<PostWithContent, Error>({
		queryKey: ["post", postId],
		queryFn: () => fetchPostDraftById(postId!),
		enabled: !!postId, // Ensures query runs only if postId is defined
		...options, // Allows passing additional options (e.g., staleTime, refetchInterval, etc.)
	});
}

export function useInvalidatePost() {
	const queryClient = useQueryClient();
	return (postId: string) =>
		queryClient.invalidateQueries({ queryKey: ["post", postId] });
}
