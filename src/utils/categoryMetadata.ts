import { PostCategory, SubCategory } from "@/db/schema/enums";

interface CategoryMetadata {
	keywords: string[];
	description: string;
	title: string;
}

export function generateCategoryMetadata(
	category: PostCategory,
	subCategory: SubCategory,
): CategoryMetadata {
	const categoryName = category.toLowerCase();
	const subCategoryName = subCategory.toLowerCase();

	// Base keywords that apply to all categories
	const baseKeywords = [
		"programming",
		"development",
		"tutorials",
		"learning",
		"coding",
		"software engineering",
		"developer resources",
	];

	// Category-specific keywords
	const categoryKeywords: Record<PostCategory, string[]> = {
		[PostCategory.FRONTEND]: [
			"frontend development",
			"web development",
			"javascript",
			"react",
			"vue",
			"angular",
			"css",
			"html",
			"typescript",
			"ui/ux",
			"responsive design",
			"web components",
			"dom manipulation",
			"browser apis",
		],
		[PostCategory.BACKEND]: [
			"backend development",
			"server-side",
			"apis",
			"databases",
			"nodejs",
			"python",
			"java",
			"microservices",
			"rest api",
			"graphql",
			"authentication",
			"authorization",
			"server architecture",
			"data modeling",
		],
		[PostCategory.ANDROID]: [
			"android development",
			"mobile development",
			"kotlin",
			"java",
			"android studio",
			"mobile apps",
			"ui design",
			"material design",
			"app development",
			"mobile architecture",
			"android sdk",
			"mobile ui/ux",
		],
	};

	// Subcategory-specific keywords
	const subCategoryKeywords: Record<SubCategory, string[]> = {
		[SubCategory.BLOGS]: [
			"blogs",
			"articles",
			"tutorials",
			"guides",
			"tips",
			"best practices",
			"how-to",
			"insights",
			"case studies",
			"examples",
		],
		[SubCategory.SYSTEMDESIGN]: [
			"system design",
			"architecture",
			"design patterns",
			"scalability",
			"performance",
			"distributed systems",
			"high availability",
			"system architecture",
			"design principles",
			"architectural patterns",
		],
		// Default cases for other subcategories
		[SubCategory.JAVASCRIPT]: [],
		[SubCategory.HTML]: [],
		[SubCategory.CSS]: [],
		[SubCategory.REACT]: [],
		[SubCategory.VUE]: [],
		[SubCategory.ANGULAR]: [],
		[SubCategory.SVELTEKIT]: [],
		[SubCategory.VANILLAJS]: [],
		[SubCategory.NEXTJS]: [],
	};

	// Combine all keywords
	const allKeywords = [
		categoryName,
		subCategoryName,
		...baseKeywords,
		...categoryKeywords[category],
		...subCategoryKeywords[subCategory],
	];

	// Generate description based on category and subcategory
	const categoryDisplayName =
		category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
	const subCategoryDisplayName =
		subCategory === SubCategory.SYSTEMDESIGN
			? "System Design"
			: subCategory.charAt(0).toUpperCase() +
				subCategory.slice(1).toLowerCase();

	const description =
		subCategory === SubCategory.BLOGS
			? `Discover the latest ${subCategoryDisplayName.toLowerCase()} in ${categoryDisplayName.toLowerCase()} development. Learn from expert insights, tutorials, and real-world examples to advance your skills.`
			: `Explore comprehensive ${subCategoryDisplayName.toLowerCase()} concepts for ${categoryDisplayName.toLowerCase()} development. Master architecture patterns, scalability solutions, and design principles.`;

	const title = `${categoryDisplayName} ${subCategoryDisplayName} - EBAT`;

	return {
		keywords: allKeywords,
		description,
		title,
	};
}
