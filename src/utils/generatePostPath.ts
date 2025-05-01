import { PostCategory, PostType, SubCategory, Post } from "@prisma/client";
import { PostWithExtraDetails, SubCategoryType } from "./types";

export function generatePostPath({
	category,
	subCategory,
	postType,
	slug,
	id,
}: {
	category: PostCategory;
	subCategory?: SubCategoryType | null;
	postType: PostType;
	slug: string;
	id: string;
}): string {
	return `/${category.toLowerCase()}/${
		subCategory ? `${subCategory.toLowerCase()}/` : ""
	}${postType?.toLowerCase()}/${slug}-${id}`;
}

export const generatePostPathFromPostId = (post: PostWithExtraDetails) => {
	return generatePostPath({
		category: post.category,
		subCategory: post.subCategory,
		postType: post.type,
		slug: post.slug || "",
		id: post.id,
	});
};
