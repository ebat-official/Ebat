import { SubCategory, SubCategoryType } from "@/db/schema/enums";

// Create a Set of valid SubCategory values
const subCategorySupportedTypes = new Set(Object.values(SubCategory));

export const isValidSubCategory = (
	subCategory: string,
): subCategory is SubCategoryType => {
	return Object.values(SubCategory).includes(subCategory as SubCategoryType);
};

export default isValidSubCategory;
