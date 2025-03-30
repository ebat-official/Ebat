import { SubCategory } from "@prisma/client";

// Create a Set of valid SubCategory values
const subCategorySupportedTypes = new Set(Object.values(SubCategory));

export default function isValidSubcategory(
	subcategory: string,
): subcategory is SubCategory {
	return subCategorySupportedTypes.has(subcategory as SubCategory);
}
