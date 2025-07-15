import {
	PostCategory,
	PostCategoryType,
	SubCategory,
	SubCategoryType,
} from "@/db/schema/enums";

export const isValidCategoryCombo = (
	category: string,
	subCategory: string,
): boolean => {
	// Check if both category and subCategory are valid enum values
	const validCategory = Object.values(PostCategory).includes(
		category as PostCategoryType,
	);
	const validSubCategory = Object.values(SubCategory).includes(
		subCategory as SubCategoryType,
	);

	return validCategory && validSubCategory;
};
