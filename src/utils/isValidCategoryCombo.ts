import { PostCategory, SubCategory } from "@prisma/client";

export function isValidCategoryCombo(
	category: string,
	subCategory: string | null,
): category is PostCategory {
	const validCombinations: Record<PostCategory, SubCategory[]> = {
		[PostCategory.FRONTEND]: [
			SubCategory.JAVASCRIPT,
			SubCategory.HTML,
			SubCategory.CSS,
			SubCategory.REACT,
		],
		[PostCategory.BACKEND]: [],
		[PostCategory.ANDROID]: [],
	};

	const categoryEnum = Object.values(PostCategory).find(
		(c) => c.toLowerCase() === category.toLowerCase(),
	) as PostCategory | undefined;

	if (!categoryEnum) return false;

	if (validCombinations[categoryEnum].length === 0) return true;

	const subCategoryEnum = subCategory
		? (Object.values(SubCategory).find(
				(sc) => sc.toLowerCase() === subCategory.toLowerCase(),
			) as SubCategory | undefined)
		: null;

	return subCategoryEnum
		? validCombinations[categoryEnum].includes(subCategoryEnum)
		: false;
}
