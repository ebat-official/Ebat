import { generatePreviewUrl } from "@/utils/generatePreviewUrl";
import { CategoryType, SubCategoryType, PostActions } from "@/utils/types";
import { PostType } from "@/db/schema/enums";
import { POST_ACTIONS } from "@/utils/constants";

export const generatePreviewUrlForAction = (params: {
	category: CategoryType;
	subCategory: SubCategoryType;
	postType: PostType;
	postId: string;
	action: PostActions;
}) => {
	const { category, subCategory, postType, postId, action } = params;

	if (action === POST_ACTIONS.EDIT) {
		return generatePreviewUrl({
			category,
			subCategory,
			postType,
			postId,
			edited: true,
		});
	}

	return generatePreviewUrl({
		category,
		subCategory,
		postType,
		postId,
	});
};
