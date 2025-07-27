import { PostType } from "@/db/schema/enums";

interface GeneratePreviewUrlParams {
	category: string;
	subCategory: string | undefined;
	postType: PostType;
	postId: string;
	edited?: boolean;
	userId?: string;
}

export function generatePreviewUrl({
	category,
	subCategory,
	postType,
	postId,
	edited = false,
	userId,
}: GeneratePreviewUrlParams): string {
	// Determine the post type path - include for all types
	const postTypePath = `${postType}s/`;

	// Build the base URL with proper handling of undefined subCategory
	const categoryPath = category.toLowerCase();
	const subCategoryPath = subCategory ? `/${subCategory.toLowerCase()}` : "";
	const postTypePathSegment = `/${postTypePath}`;

	let previewUrl = `/${categoryPath}${subCategoryPath}${postTypePathSegment}preview/${postId}`;

	// Add query parameters if needed
	const queryParams = new URLSearchParams();

	if (edited) {
		queryParams.append("edited", "true");
	}

	if (userId) {
		queryParams.append("user", userId);
	}

	// Append query parameters if any exist
	if (queryParams.toString()) {
		previewUrl += `?${queryParams.toString()}`;
	}

	return previewUrl;
}
