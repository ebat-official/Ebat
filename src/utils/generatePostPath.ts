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
	const baseUrl = `/${category}/${subCategory}`;

	if (postType === "CHALLENGE") {
		return `${baseUrl}/challenges/${slug || id}`;
	}

	if (postType === "QUESTION") {
		return `${baseUrl}/questions/${slug || id}`;
	}

	return `${baseUrl}/${slug || id}`;
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
