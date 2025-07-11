import { PostCategory, PostCategoryType } from "@/db/schema/enums";

export const isValidCategory = (category: string): category is PostCategoryType => {
	return Object.values(PostCategory).includes(category as PostCategoryType);
};

export default isValidCategory;
