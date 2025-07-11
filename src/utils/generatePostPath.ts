import {
	PostCategoryType,
	PostTypeType,
	SubCategoryType,
} from "@/db/schema/enums";
import { Post } from "@/db/schema/zod-schemas";
import { PostWithExtraDetails } from "@/utils/types";

export const generatePostPath = ({
	category,
	subCategory,
	slug,
	id,
	postType,
}: {
	category: PostCategoryType;
	subCategory: SubCategoryType | null;
	slug: string;
	id: string;
	postType: PostTypeType;
}) => {
	return `/${category.toLowerCase()}/${
		subCategory ? `${subCategory.toLowerCase()}/` : ""
	}${postType?.toLowerCase()}/${slug}-${id}`;
};

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
