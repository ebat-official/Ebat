import {
	PostCategoryType,
	PostType,
	PostTypeType,
	SubCategoryType,
} from "@/db/schema/enums";
import { Post } from "@/db/schema/zod-schemas";
import { PostWithExtraDetails } from "@/utils/types";

interface GeneratePostPathParams {
	category: PostCategoryType;
	subCategory: SubCategoryType | null;
	slug: string;
	id: string;
	postType: PostTypeType;
}

export function generatePostPath({
	category,
	subCategory,
	slug,
	id,
	postType,
}: GeneratePostPathParams): string {
	// Determine the post type path - include for all types
	const postTypePath = `${postType}s/`;

	// Build the base URL with proper handling of null subCategory
	const categoryPath = category.toLowerCase();
	const subCategoryPath = subCategory ? `/${subCategory.toLowerCase()}` : "";
	const postTypePathSegment = `/${postTypePath}`;

	const postUrl = `/${categoryPath}${subCategoryPath}${postTypePathSegment}${slug}-${id}`;

	return postUrl;
}

export const generatePostPathFromPostId = (
	post: Post | PostWithExtraDetails,
) => {
	return generatePostPath({
		category: post.category,
		subCategory: post.subCategory,
		postType: post.type,
		slug: post.slug || "",
		id: post.id,
	});
};
