import { PostType } from "@/db/schema/enums";

interface GeneratePreviewUrlParams {
	category: string;
	subCategory: string | undefined;
	postType: PostType;
	postId: string;
	edited?: boolean;
	userId?: string;
	diffview?: boolean;
}

export function generatePreviewUrl({
	category,
	subCategory,
	postType,
	postId,
	edited = false,
	userId,
	diffview = false,
}: GeneratePreviewUrlParams): string {
	// Determine the post type path
	const postTypePath =
		postType === PostType.CHALLENGE || postType === PostType.QUESTION
			? `${postType}s/`
			: "";

	// Build the base URL
	let previewUrl = `/${category}/${subCategory || ""}/${postTypePath}preview/${postId}`;

	// Add query parameters if needed
	const queryParams = new URLSearchParams();

	if (edited) {
		queryParams.append("edited", "true");
	}

	if (userId) {
		queryParams.append("user", userId);
	}

	if (diffview) {
		queryParams.append("diffview", "true");
	}

	// Append query parameters if any exist
	if (queryParams.toString()) {
		previewUrl += `?${queryParams.toString()}`;
	}

	return previewUrl;
}
